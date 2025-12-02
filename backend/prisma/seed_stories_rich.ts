import { PrismaClient, StoryMediaType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding stories...');

    // Clean up existing stories
    try {
        await prisma.storyPage.deleteMany({});
        await prisma.story.deleteMany({});
    } catch (e) {
        console.log('No existing stories to delete or error deleting:', e);
    }

    const stories = [
        {
            title: 'Карта основателя',
            previewImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', // Gym girl
            priority: 100,
            pages: [
                {
                    type: StoryMediaType.IMAGE,
                    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', // Gym girl background
                    duration: 10000,
                    content: {
                        elements: [
                            {
                                type: 'text',
                                content: '30 000 бонусов\nна весь 2026 год',
                                style: {
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: 'white',
                                    textAlign: 'center',
                                    marginTop: '30%',
                                    lineHeight: '1.1'
                                }
                            },
                            {
                                type: 'text',
                                content: 'В честь открытия дарим карту основателя, которая предоставляет 30 000 бонусов на весь 2026 год.',
                                style: {
                                    fontSize: '15px',
                                    color: 'rgba(255,255,255,0.8)',
                                    textAlign: 'center',
                                    marginTop: '20px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'list',
                                items: [
                                    { icon: 'coin', text: '1 бонус = 1 рубль.' },
                                    { icon: 'percent', text: 'Во время покупки вы можете использовать до 30% от стоимости товара.' }
                                ],
                                style: {
                                    marginTop: '30px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'text',
                                content: 'Как получить карту?',
                                style: {
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginTop: '40px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'text',
                                content: 'Для получения карты необходимо совершить покупку в период с 12 по 16 декабря на сумму от 5000 ₽ в одном из трех магазинов.',
                                style: {
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)',
                                    marginTop: '10px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'button',
                                label: 'Осталось карт: 300/300',
                                action: '/founder-card',
                                style: {
                                    backgroundColor: '#FF6B00',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginTop: 'auto',
                                    marginBottom: '40px',
                                    width: 'calc(100% - 40px)',
                                    marginLeft: '20px'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'Пригласи друга',
            previewImage: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80', // Happy friends
            priority: 90,
            pages: [
                {
                    type: StoryMediaType.IMAGE,
                    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
                    duration: 10000,
                    content: {
                        elements: [
                            {
                                type: 'text',
                                content: 'Пригласи друга\n— получи бонусы',
                                style: {
                                    fontSize: '32px',
                                    fontWeight: '800',
                                    color: 'white',
                                    textAlign: 'center',
                                    marginTop: '35%',
                                    lineHeight: '1.1'
                                }
                            },
                            {
                                type: 'list',
                                items: [
                                    { number: '1.', text: 'Отправьте вашу уникальную <span style="color:#FF6B00">реферальную ссылку друзьям</span>, у которых ещё нет аккаунта в нашем магазине.' },
                                    { number: '2.', text: 'За регистрацию друга — 50 Бонусов. Как только ваш друг зарегистрируется по вашей ссылке, вы сразу получите 50 бонусов на свой счёт.' },
                                    { number: '3.', text: 'Если ваш друг совершит свою первую покупку до конца года, вы получите <span style="color:#FF6B00">дополнительно 200 бонусов</span>. Сумма его покупки может быть любой.' }
                                ],
                                style: {
                                    marginTop: '30px',
                                    padding: '0 20px',
                                    gap: '15px'
                                }
                            },
                            {
                                type: 'button',
                                label: 'скопировать ссылку',
                                action: 'copy_referral',
                                style: {
                                    backgroundColor: '#FF6B00',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginTop: 'auto',
                                    marginBottom: '40px',
                                    width: 'calc(100% - 40px)',
                                    marginLeft: '20px'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'День открытия',
            previewImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80', // Gym interior
            priority: 80,
            pages: [
                {
                    type: StoryMediaType.IMAGE,
                    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
                    duration: 10000,
                    content: {
                        elements: [
                            {
                                type: 'text',
                                content: '12 декабря\n— день открытия',
                                style: {
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: 'white',
                                    textAlign: 'center',
                                    marginTop: '40%',
                                    lineHeight: '1.1'
                                }
                            },
                            {
                                type: 'text',
                                content: '12 декабря в Хабаровске открывается 3 магазина «5lb» по следующим адресам:',
                                style: {
                                    fontSize: '15px',
                                    color: 'rgba(255,255,255,0.8)',
                                    textAlign: 'center',
                                    marginTop: '30px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'list',
                                items: [
                                    { icon: 'map-pin', text: 'ТЦ Пихта (1 этаж);' },
                                    { icon: 'map-pin', text: 'ТЦ Макси Молл (1 этаж);' },
                                    { icon: 'map-pin', text: 'Гастромаркет «Березка» (ул. Тургенева, 46).' }
                                ],
                                style: {
                                    marginTop: '30px',
                                    padding: '0 20px',
                                    gap: '15px'
                                }
                            },
                            {
                                type: 'text',
                                content: 'Единый номер для связи:',
                                style: {
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.6)',
                                    textAlign: 'center',
                                    marginTop: 'auto',
                                    marginBottom: '10px'
                                }
                            },
                            {
                                type: 'button',
                                label: '+7 (924) 151 25-55',
                                icon: 'phone',
                                action: 'tel:+79241512555',
                                style: {
                                    backgroundColor: '#FF6B00',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '40px',
                                    width: 'calc(100% - 40px)',
                                    marginLeft: '20px'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'Кэшбек до 110%',
            previewImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', // Man lifting
            priority: 70,
            pages: [
                {
                    type: StoryMediaType.IMAGE,
                    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                    duration: 10000,
                    content: {
                        elements: [
                            {
                                type: 'text',
                                content: 'Кэшбек до 110%\n— реальность',
                                style: {
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: 'white',
                                    textAlign: 'center',
                                    marginTop: '40%',
                                    lineHeight: '1.1'
                                }
                            },
                            {
                                type: 'list',
                                items: [
                                    { number: '1.', text: 'Сразу после оплаты каждой покупки в приложении вам становится доступно Колесо Фортуны.' },
                                    { number: '2.', text: 'Процент кэшбека начисляется на ту сумму, которую вы фактически оплатили (после всех скидок и до использования бонусов).' },
                                    { number: '3.', text: 'Бонусы мгновенно зачисляются на ваш счет, как только вы прокрутите колесо.' }
                                ],
                                style: {
                                    marginTop: '30px',
                                    padding: '0 20px',
                                    gap: '20px'
                                }
                            },
                            {
                                type: 'button',
                                label: 'Кешбэк 10% до 110% от суммы покупки',
                                action: '/wheel',
                                style: {
                                    backgroundColor: '#FF6B00',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginTop: 'auto',
                                    marginBottom: '40px',
                                    width: 'calc(100% - 40px)',
                                    marginLeft: '20px'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'Как использовать',
            previewImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', // Woman fitness
            priority: 60,
            pages: [
                {
                    type: StoryMediaType.IMAGE,
                    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                    duration: 10000,
                    content: {
                        elements: [
                            {
                                type: 'text',
                                content: 'Как использовать\nБонусы',
                                style: {
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: 'white',
                                    textAlign: 'center',
                                    marginTop: '40%',
                                    lineHeight: '1.1'
                                }
                            },
                            {
                                type: 'list',
                                items: [
                                    { icon: 'coin', text: '1 бонус = 1 рубль.' },
                                    { icon: 'percent', text: 'Вы можете оплатить бонусами до 30% от итоговой стоимости покупки.' }
                                ],
                                style: {
                                    marginTop: '30px',
                                    padding: '0 20px',
                                    gap: '15px'
                                }
                            },
                            {
                                type: 'text',
                                content: 'Обычные бонусы, начисленные за покупки, действуют 6 месяцев (180 дней) с момента их получения. Если вы их не потратите, они автоматически сгорят.',
                                style: {
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)',
                                    marginTop: '20px',
                                    padding: '0 20px'
                                }
                            },
                            {
                                type: 'text',
                                content: '<span style="color:#FF6B00">Важное исключение при списании:</span> мы всегда начисляем вам кэшбек, но иногда у нас есть товары, на которые мы не можем дать дополнительную скидку бонусами.',
                                style: {
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)',
                                    marginTop: '20px',
                                    padding: '0 20px'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ];

    for (const storyData of stories) {
        const { pages, ...storyInfo } = storyData;
        const story = await prisma.story.create({
            data: {
                ...storyInfo,
                isActive: true,
                pages: {
                    create: pages
                }
            }
        });
        console.log(`Created story: ${story.title}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
