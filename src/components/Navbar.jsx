"use client";
import { IconMenu, IconMenuDeep, IconX, IconHome, IconUser, IconSettings, IconBell, IconLogout } from '@tabler/icons-react'
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import React, { useState } from 'react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { icon: <IconHome size={20} />, label: 'Home', href: '/home', color: " hover:bg-violet-200" },
        { icon: <IconUser size={20} />, label: 'Login', href: '/login', color: " hover:bg-violet-200" },
        { icon: <IconSettings size={20} />, label: 'Settings', href: '#', color: " hover:bg-violet-200" },
        // { icon: <IconBell size={20} />, label: 'Notifications', href: '#', color: " hover:bg-violet-200" },
        // { icon: <IconLogout size={20} />, label: 'Logout', href: '/logout', color: " hover:bg-red-200" },
    ];

    return (
        <>
            {/* Navbar */}
            <div className='fixed top-0 left-0 right-0 h-14 w-full flex items-center justify-between gap-2 px-2 md:px-4 lg:px-8 py-3 shadow-md bg-white z-50'>
                <Link href={'/'}>
                    <img
                        src="https://nocache-appxdb-v2.classx.co.in/subject/2025-08-23-0.6871633195243798.png"
                        className="h-12"
                        alt="Logo"
                    />
                </Link>
                <div
                    className='cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <IconX /> : <IconMenuDeep />}
                </div>
            </div >

            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className='fixed inset-0 bg-transparent z-40 transition-opacity duration-300'
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-full sm:w-72 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex flex-col h-full p-4'>
                    <h2 className='text-xl font-semibold mb-6 text-gray-800'>Menu</h2>

                    <nav className='flex-1 overflow-y-auto'>
                        <ul className='space-y-2'>
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg  transition-colors duration-200 text-gray-700 hover:text-gray-900 ${item.color}`}
                                        onClick={() => { setIsMenuOpen(false); }}
                                    >
                                        {item.icon}
                                        <span className='font-medium'>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg  transition-colors duration-200  text-white bg-red-500 cursor-pointer font-medium">
                            <IconLogout size={20} />
                            Sign out
                        </button>

                    <div className='border-t border-gray-200 pt-4 mt-4'>
                        <p className='text-sm text-gray-500 text-center'>© {new Date().getFullYear()} Teaching Pariksha</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar