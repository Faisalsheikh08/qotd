'use client'
import Navbar from '@/components/Navbar'
import { IconArrowLeft } from '@tabler/icons-react'
import { redirect, RedirectType } from 'next/navigation'
import React, { useState } from 'react'

const page = () => {
    const [answer, setAnswer] = useState("")
    return (
        <div>
            <Navbar />
            <div className='min-h-dvh px-4 lg:px-8 pt-18 pb-2 bg-gradient-to-b from-white to-violet-100'>
                <div className='max-w-3xl mx-auto'>
                    <div className='flex items-center space-x-2 mb-4'>
                        <IconArrowLeft onClick={() => redirect('/home', RedirectType.push)} className='cursor-pointer' />
                        <span className='font-medium text-lg'>Question of the Day</span>
                    </div>
                    <h1 className='text-xl font-semibold'>
                        Que. Who is the current Prime Minister of India?
                    </h1>
                    <div className='mt-4 '>
                        <textarea name="answer" className="border-2 rounded-xl w-full min-h-[60vh] p-4 outline-none bg-white" placeholder='Your answer here...' value={answer} onChange={(e) => setAnswer(e.target.value)}></textarea>
                    </div>
                    {answer.length > 0 && <p className='text-sm text-gray-600 mt-1'>Word Count: <span className={answer.split(" ").length < 180 ? "text-red-500" : "text-green-500"}>{answer.split(" ").length}</span></p>}
                    <button disabled={answer.length < 10} className={`mt-4 bg-violet-600 text-white py-3 px-6 rounded-xl font-medium ${answer.length < 10 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-violet-700'}`}>
                        Submit Answer
                    </button>
                </div>
            </div>
        </div>
    )
}

export default page