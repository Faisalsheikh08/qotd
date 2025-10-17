import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link'
import React from 'react'

// const que = {
//     id: 1,
//     title: "The Future of Artificial Intelligence",
//     description: "How do you think artificial intelligence will transform society in the next decade? Consider both positive opportunities and...",
//     tags: ["Technology", "Intermediate", "100 XP"],
//     date: "Jan 15, 2025"
// }
const PreviousQuestionsCard = ({ question }) => {
    return (
        <div className=" p-4 mt-2 border border-gray-200 bg-white rounded-lg shadow-md hover:shadow-md transition">
            {/* Title */}
            <div className='flex justify-between items-start gap-2'>
                <h2 className="text-lg font-semibold text-gray-900 truncate ">
                    {question.title}
                </h2>
                <Link href={`/question/${question.id}`} className='inline-flex items-center min-w-fit py-1 md:py-2 px-3 bg-violet-500 hover:bg-violet-600 cursor-pointer rounded-full text-white text-sm font-medium'>
                    Get Analysis <IconChevronRight size={18} />
                </Link>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mt-1 truncate">
                {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
                {question.tags.map((tag, index) => (
                    // if tag is beginner then bg-green-100 else if intermediate then bg-yellow-100 then advanced bg-red-100 else purple-100
                    <span key={index} className={`text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded ${tag === "Beginner" ? "bg-green-100" : tag === "Intermediate" ? "bg-amber-100" : tag === "Advanced" ? "bg-red-100" : "bg-purple-100"}`}>
                        {tag}
                    </span>
                ))}

                <span className="flex items-center text-xs text-gray-600 ml-auto">
                    <IconCalendar className="mr-1" size={14} />
                    {question.date}
                </span>
            </div>


        </div>
    );
}

export default PreviousQuestionsCard