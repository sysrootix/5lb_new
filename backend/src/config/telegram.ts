import TelegramBot from 'node-telegram-bot-api';
import { env } from './env';
import { logger } from './logger';
import { prisma } from './database';

export const telegramBot = env.telegramBotToken
  ? new TelegramBot(env.telegramBotToken, { polling: { interval: 300, autoStart: true } })
  : null;

let botInitialized = false;

const buildStartMessage = (firstName?: string) => {
  const greeting = firstName && firstName.trim().length > 0 ? `Привет, ${firstName}! 👋` : 'Привет! 👋';

  return [
    greeting,
    '',
    'Я официальный бот магазина спортивного питания 5LB.',
    'Помогу быстро открыть наше приложение, чтобы оформить заказ на протеин, витамины и другие спортивные товары.',
    '',
    'Нажми на кнопку ниже и переходи в приложение 5LB.'
  ].join('\n');
};

const buildPrizeMessage = (prizeName: string, isRegistered: boolean) => {
  if (isRegistered) {
    return [
      '🎉 Поздравляем!',
      '',
      `Вы выиграли: ${prizeName}`,
      '',
      'Бонусы начислены на вашу базовую карту.'
    ].join('\n');
  } else {
    return [
      '🎉 Поздравляем!',
      '',
      `Вы выиграли: ${prizeName}`,
      '',
      'Для получения приза необходимо зарегистрироваться в боте 5LB.',
      'Нажмите на кнопку ниже, чтобы открыть приложение и зарегистрироваться.'
    ].join('\n');
  }
};

export const initTelegramBot = () => {
  if (!telegramBot) {
    logger.warn('Telegram bot token not provided; Telegram auth disabled');
    return;
  }

  if (botInitialized) {
    return;
  }
  botInitialized = true;

  const webAppUrl = env.appDomain ?? 'https://app.5lb.pro';

  void telegramBot
    .setMyCommands([{ command: 'start', description: 'Начать работу с ботом 5LB' }])
    .catch((error) => {
      logger.warn(`Failed to register Telegram commands: ${(error as Error).message}`);
    });

  telegramBot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name;
    const telegramId = msg.from?.id?.toString();
    const hash = match?.[1]; // Параметр после /start

    try {
      // Если есть hash - это ссылка на приз или карту основателя
      if (hash && hash.length >= 8) {
        // 1. Обработка Карты Основателя
        if (hash.startsWith('founder_')) {
          const code = hash.replace('founder_', '');
          const founderLink = await prisma.foundersLink.findUnique({ where: { code } });

          if (!founderLink) {
            await telegramBot.sendMessage(chatId, '❌ Ссылка недействительна.', {
              reply_markup: { inline_keyboard: [[{ text: 'Открыть 5LB WebApp', web_app: { url: webAppUrl } }]] }
            });
            return;
          }

          if (founderLink.isUsed) {
            // Check if used by THIS user
            if (founderLink.telegramId === telegramId) {
              await telegramBot.sendMessage(chatId, '✅ Вы уже активировали эту карту.', {
                reply_markup: { inline_keyboard: [[{ text: 'Открыть карту', web_app: { url: webAppUrl } }]] }
              });
              return;
            }
            await telegramBot.sendMessage(chatId, '⚠️ Эта ссылка уже была использована.', {
              reply_markup: { inline_keyboard: [[{ text: 'Открыть 5LB WebApp', web_app: { url: webAppUrl } }]] }
            });
            return;
          }

          // Check registration
          let user = telegramId ? await prisma.user.findUnique({ where: { telegramId } }) : null;

          if (user) {
            // Activate immediately
            const { bonusService } = await import('../services/bonus.service');
            await bonusService.activateFounderCard(user.id);

            // Mark link as used
            await prisma.foundersLink.update({
              where: { id: founderLink.id },
              data: { isUsed: true, usedAt: new Date(), userId: user.id, telegramId }
            });

            await telegramBot.sendMessage(chatId,
              '🎉 Карта Основателя активирована!\n\nБаланс: 30 000 бонусов\nДействует до: 31.12.2026\n\nБонусы уже доступны в вашем профиле.',
              {
                reply_markup: { inline_keyboard: [[{ text: 'Открыть профиль', web_app: { url: webAppUrl } }]] }
              }
            );
          } else {
            // Not registered
            // Mark as "pending" for this telegramId? Or just let them register via WebApp with param?
            // We will pass the code to WebApp so it can activate it after registration.
            // But we also want to mark that this telegramId "claimed" it so no one else takes it?
            // For now, let's NOT mark it used until actual activation.
            // But we send them to WebApp with ?start_param=founder_<code>

            const webAppUrlWithParam = `${webAppUrl}?start_param=${hash}`; // Telegram WebApp reads start_param from initData, or we can pass as query param if we handle it in frontend router.
            // Standard Telegram WebApp way is start_param in initData, but for direct URL opening we might want query param.
            // Let's use query param `?founderCode=${code}` for simplicity in our frontend router.
            const registerUrl = `${webAppUrl}/login?founderCode=${code}`;

            await telegramBot.sendMessage(chatId,
              'Чтобы активировать "Карту Основателя" с балансом 30 000 бонусов, вам нужно зарегистрироваться.',
              {
                reply_markup: { inline_keyboard: [[{ text: 'Зарегистрироваться', web_app: { url: registerUrl } }]] }
              }
            );
          }
          return;
        }

        // 2. Обработка Призов (существующий код)
        // Получаем информацию о призе из БД
        const prizeCode = await prisma.prizeCode.findUnique({
          where: { hash }
        });

        if (!prizeCode) {
          await telegramBot.sendMessage(
            chatId,
            '❌ Код не найден или недействителен. Возможно, ссылка устарела.',
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Открыть 5LB WebApp',
                      web_app: { url: webAppUrl }
                    }
                  ]
                ]
              }
            }
          );
          return;
        }

        // Проверяем, зарегистрирован ли пользователь
        let user = null;
        if (telegramId) {
          user = await prisma.user.findUnique({
            where: { telegramId }
          });
        }

        const isRegistered = !!user;

        // Проверяем, крутил ли пользователь рулетку
        if (isRegistered && user) {
          const rouletteLog = await prisma.rouletteLog.findUnique({
            where: { userId: user.id }
          });

          if (rouletteLog) {
            logger.info(
              `⚠️ Пользователь ${user.id} (Telegram ID: ${telegramId}) уже крутил рулетку, приветственные бонусы недоступны`
            );

            await telegramBot.sendMessage(
              chatId,
              '⚠️ Вы уже получали приветственные бонусы. Промокоды доступны только новым пользователям.',
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Открыть 5LB WebApp',
                        web_app: { url: webAppUrl }
                      }
                    ]
                  ]
                }
              }
            );
            return;
          }
        }

        // Проверяем, использовал ли этот telegramId уже какой-либо код приза (независимо от регистрации)
        if (telegramId) {
          const telegramUsedPrize = await prisma.prizeCode.findFirst({
            where: {
              telegramId: telegramId
            }
          });

          // Если этот telegramId уже использовал какой-то код приза
          if (telegramUsedPrize) {
            logger.info(
              `⚠️ Telegram ID ${telegramId} уже получал приз ранее. User ID: ${user?.id || 'не зарегистрирован'}, Имя: ${user?.firstName || 'Не указано'}`
            );

            await telegramBot.sendMessage(
              chatId,
              '⚠️ Вы уже получали приз ранее. Один аккаунт может получить приз только один раз.',
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Открыть 5LB WebApp',
                        web_app: { url: webAppUrl }
                      }
                    ]
                  ]
                }
              }
            );
            return;
          }
        }

        // Проверяем, использован ли этот конкретный код другим telegramId
        if (prizeCode.telegramId && prizeCode.telegramId !== telegramId) {
          await telegramBot.sendMessage(
            chatId,
            '⚠️ Этот код уже был использован другим пользователем.',
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Открыть 5LB WebApp',
                      web_app: { url: webAppUrl }
                    }
                  ]
                ]
              }
            }
          );
          return;
        }

        // Код свободен и telegramId еще не получал приз - начисляем приз
        if (isRegistered && user) {
          logger.info(
            `🎁 Пользователь зарегистрирован! Ему начисляется: ${prizeCode.prizeName} (код: ${prizeCode.prizeCode})`
          );
          logger.info(`   Telegram ID: ${telegramId}, User ID: ${user.id}, Имя: ${user.firstName || 'Не указано'}`);
        } else {
          logger.info(
            `🎁 Пользователь НЕ зарегистрирован, но приз привязан к Telegram ID. Ему бы начислилось: ${prizeCode.prizeName} (код: ${prizeCode.prizeCode})`
          );
          logger.info(`   Telegram ID: ${telegramId || 'Не указан'}`);
        }

        // Помечаем код как использованный этим telegramId (и userId если зарегистрирован)
        await prisma.prizeCode.update({
          where: { id: prizeCode.id },
          data: {
            used: true,
            usedAt: new Date(),
            telegramId: telegramId || null,
            userId: user?.id || null
          }
        });

        // Начисление призовых бонусов на базовую карту
        if (isRegistered && user) {
          // Извлекаем сумму бонусов из кода приза
          const extractBonusAmount = (prizeCode: string): number => {
            const match = prizeCode.match(/bonus_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };

          const bonusAmount = extractBonusAmount(prizeCode.prizeCode);

          if (bonusAmount > 0) {
            try {
              const { bonusService } = await import('../services/bonus.service');
              await bonusService.awardPrizeBonuses(
                user.id,
                bonusAmount,
                `Приз из колеса фортуны: ${prizeCode.prizeName}`
              );
              logger.info(`✅ Начислено ${bonusAmount} бонусов пользователю ${user.id} на базовую карту`);
            } catch (error) {
              logger.error(`❌ Ошибка начисления бонусов пользователю ${user.id}:`, error);
            }
          }
        }

        // Отправляем сообщение пользователю
        // Для незарегистрированных пользователей открываем страницу входа/регистрации
        const webAppUrlForUser = isRegistered ? webAppUrl : `${webAppUrl}/login`;
        const buttonText = isRegistered ? 'Открыть 5LB WebApp' : 'Зарегистрироваться';

        await telegramBot.sendMessage(chatId, buildPrizeMessage(prizeCode.prizeName, isRegistered), {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: buttonText,
                  web_app: { url: webAppUrlForUser }
                }
              ]
            ]
          }
        });
      } else if (hash && hash.length > 0) {
        // Короткий hash - это реферальный код
        const referralCode = hash.toUpperCase();

        // Записываем реферальный клик в базу данных
        try {
          const { recordReferralClick } = await import('../services/referralClickService');
          const result = await recordReferralClick(telegramId || '', referralCode);

          if (result.success && result.referrerName) {
            // Показываем сообщение о приглашении
            const referralMessage = [
              `Привет, ${firstName}! 👋`,
              '',
              `Вас пригласил: ${result.referrerName}`,
              '',
              '🎁 Зарегистрируйтесь и получите возможность покрутить рулетку! Выиграйте от 100 до 10 000 бонусов!',
              '',
              'Нажмите на кнопку ниже, чтобы открыть приложение 5LB и зарегистрироваться.'
            ].join('\n');

            await telegramBot.sendMessage(chatId, referralMessage, {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Открыть 5LB WebApp',
                      web_app: { url: webAppUrl }
                    }
                  ]
                ]
              }
            });

            logger.info(`✅ Реферальный клик записан: ${telegramId} → ${referralCode} (${result.referrerName})`);
          } else {
            // Если код неверный или пользователь уже зарегистрирован - показываем обычное приветствие
            await telegramBot.sendMessage(chatId, buildStartMessage(firstName), {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Открыть 5LB WebApp',
                      web_app: { url: webAppUrl }
                    }
                  ]
                ]
              }
            });
          }
        } catch (error) {
          logger.error('Failed to record referral click', error as Error);
          // В случае ошибки показываем обычное приветствие
          await telegramBot.sendMessage(chatId, buildStartMessage(firstName), {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Открыть 5LB WebApp',
                    web_app: { url: webAppUrl }
                  }
                ]
              ]
            }
          });
        }
      } else {
        // Обычная команда /start без параметров
        await telegramBot.sendMessage(chatId, buildStartMessage(firstName), {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Открыть 5LB WebApp',
                  web_app: { url: webAppUrl }
                }
              ]
            ]
          }
        });
      }
    } catch (error) {
      logger.error('Failed to send Telegram /start response', error as Error);
      try {
        await telegramBot.sendMessage(
          chatId,
          'Произошла ошибка при обработке запроса. Попробуйте позже.',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Открыть 5LB WebApp',
                    web_app: { url: webAppUrl }
                  }
                ]
              ]
            }
          }
        );
      } catch (sendError) {
        logger.error('Failed to send error message to user', sendError as Error);
      }
    }
  });

  logger.info('Telegram bot initialized');
};
