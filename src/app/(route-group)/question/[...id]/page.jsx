'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

const page = () => {
    const params = useParams()
    console.log(params)
    return (
        <div>
            <Navbar />
            <div className='min-h-dvh px-2 md:px-4 lg:px-8 pt-18 pb-2'>

                Question id: {params.id}</div>
        </div>
    )
}

export default page