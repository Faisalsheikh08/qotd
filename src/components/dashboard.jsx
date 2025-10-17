"use client";
import Navbar from '@/components/Navbar';
import { IconMenu, IconMenuDeep, IconX, IconDashboard, IconFileText, IconTable, IconChartBar, IconSettings, IconLogout, IconChevronDown, IconUsers, IconCalendarQuestion, IconCloudCheck, IconListLetters, IconStack2Filled, IconLayoutGridAdd } from '@tabler/icons-react'
import Link from 'next/link';
import React, { useState } from 'react'

const DashboardLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);

    const menuItems = [
        {
            icon: <IconDashboard size={20} />,
            label: 'Dashboard',
            href: '/admin/dashboard',
            subMenu: null
        },
        {
            icon: <IconListLetters size={20} />,
            label: 'Exams',
            href: '#',
            subMenu: null
        },
        {
            icon: <IconCalendarQuestion size={20} />,
            label: 'Questions',
            href: '/admin/questions',
            subMenu: null
        },
        {
            icon: <IconCloudCheck size={20} />,
            label: 'Submissions',
            href: '/admin/submissions',
            subMenu: null
        },
        {
            icon: <IconUsers size={20} />,
            label: 'Users',
            href: '/admin/users',
            subMenu: null
        },
        {
            icon: <IconChartBar size={20} />,
            label: 'Leaderboard',
            href: '#',
            subMenu: null
        },
        {
            icon: <IconLayoutGridAdd size={20} />,
            label: 'Content',
            href: '#',
            subMenu: [
                { label: 'Courses', href: '#' },
                { label: 'Advertisements', href: '#' },
            ]
        },
        // {
        //     icon: <IconTable size={20} />,
        //     label: 'Tables',
        //     href: '#',
        //     subMenu: [
        //         { label: 'Basic Table', href: '#' },
        //         { label: 'Data Table', href: '#' },
        //     ]
        // },
        // {
        //     icon: <IconFileText size={20} />,
        //     label: 'UI Elements',
        //     href: '#',
        //     subMenu: null
        // },
        // {
        //     icon: <IconSettings size={20} />,
        //     label: 'Authentication',
        //     href: '#',
        //     subMenu: null
        // },
    ];

    const toggleSubmenu = (index) => {
        setExpandedMenu(expandedMenu === index ? null : index);
    };

    return (
        <div className='flex h-screen bg-gray-50'>
            {/* Left Sidebar - Desktop */}
            <aside className='hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col fixed h-screen z-40'>
                <Link href={'/'} className='flex items-center h-14 px-8 border-b border-gray-200'>
                    <img
                        src="https://nocache-appxdb-v2.classx.co.in/subject/2025-08-23-0.6871633195243798.png"
                        className="h-12 "
                        alt="Logo"
                    />
                </Link>

                <nav className='flex-1 overflow-y-auto p-4 space-y-2'>
                    <p className='text-xs font-semibold text-gray-500 uppercase px-4 mb-4'>MENU</p>
                    {menuItems.map((item, index) => (
                        <div key={index}>
                            {item.subMenu ? (
                                <button
                                    onClick={() => toggleSubmenu(index)}
                                    className='w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-gray-900'
                                >
                                    <div className='flex items-center gap-3'>
                                        {item.icon}
                                        <span className='font-medium text-sm'>{item.label}</span>
                                    </div>
                                    <IconChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${expandedMenu === index ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-gray-900'
                                >
                                    <div className='flex items-center gap-3'>
                                        {item.icon}
                                        <span className='font-medium text-sm'>{item.label}</span>
                                    </div>
                                </Link>
                            )}

                            {item.subMenu && expandedMenu === index && (
                                <div className='pl-4 space-y-1'>
                                    {item.subMenu.map((sub, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            href={sub.href}
                                            className='flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-gray-900 text-sm'
                                        >
                                            <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className='p-4 border-t border-gray-200'>
                    <button className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-gray-900'>
                        <IconLogout size={20} />
                        <span className='font-medium text-sm'>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className='flex-1 md:ml-64 flex flex-col h-screen'>
                {/* Top Navbar */}
                <div className='fixed top-0 left-0 right-0 md:left-64 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-50'>
                    <div className='flex items-center gap-4'>
                        <button
                            className='md:hidden cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors'
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <IconX /> : <IconMenuDeep />}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar Menu */}
                {isMenuOpen && (
                    <>
                        <div
                            className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className='fixed top-14 left-0 right-0 h-[calc(100vh-3.5rem)] bg-white z-40 md:hidden overflow-y-auto'>
                            <nav className='p-4 space-y-2'>
                                {menuItems.map((item, index) => (
                                    <div key={index}>
                                        {item.subMenu ? (
                                            <button
                                                onClick={() => toggleSubmenu(index)}
                                                className='w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {item.icon}
                                                    <span className='font-medium text-sm'>{item.label}</span>
                                                </div>
                                                <IconChevronDown
                                                    size={16}
                                                    className={`transition-transform ${expandedMenu === index ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700'
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {item.icon}
                                                    <span className='font-medium text-sm'>{item.label}</span>
                                                </div>
                                            </Link>
                                        )}

                                        {item.subMenu && expandedMenu === index && (
                                            <div className='pl-4 space-y-1'>
                                                {item.subMenu.map((sub, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        href={sub.href}
                                                        className='flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm'
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </>
                )}

                {/* Main Content Area */}
                <main className='flex-1 overflow-y-auto p-6 pt-18'>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout