'use client'
import React, { Suspense, useRef, useEffect, Fragment, useState } from 'react'
import Navbar from '@/components/Navbar'
import { redirect, RedirectType } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import Heading from '@/components/Heading'
import PreviousQuestionsCard from '@/components/PreviousQuestionsCard'
import CourseCard from '@/components/CourseCard'
import MonthCalendar from '@/components/Calendar'
import Image from 'next/image'
import Ads from '@/components/Ads'
import Testimonial from '@/components/Testimonial'

const questions = [
    {
        id: 1,
        title: "The Future of Artificial Intelligence",
        description:
            "How do you think artificial intelligence will transform society in the next decade? Consider both positive opportunities and...",
        tags: ["Technology", "Intermediate", "🪙 100"],
        date: "Oct 15, 2025",
    },
    {
        id: 2,
        title: "Climate Change and Its Global Impact",
        description:
            "Discuss the primary causes of climate change and propose potential global strategies to combat it.",
        tags: ["Environment", "Advanced", "🪙 120"],
        date: "Oct 14, 2025",
    },
    {
        id: 3,
        title: "Basics of Photosynthesis",
        description:
            "Explain how photosynthesis works in plants and why it is essential for life on Earth.",
        tags: ["Biology", "Beginner", "🪙 80"],
        date: "Oct 13, 2025",
    },
    {
        id: 4,
        title: "Understanding the Pythagorean Theorem",
        description:
            "Describe the Pythagorean Theorem and provide a real-life example of how it can be used.",
        tags: ["Mathematics", "Intermediate", "🪙 100"],
        date: "Oct 12, 2025",
    },
    {
        id: 5,
        title: "World War II: Causes and Consequences",
        description:
            "What were the key causes of World War II, and what long-term impacts did it have on the world?",
        tags: ["History", "Advanced", "🪙 130"],
        date: "Oct 11, 2025",
    },
    {
        id: 6,
        title: "The Role of Gravity in Space",
        description:
            "How does gravity affect the movement of planets and satellites in space?",
        tags: ["Physics", "Intermediate", "🪙 100"],
        date: "Oct 10, 2025",
    },
    {
        id: 7,
        title: "The Importance of Financial Literacy",
        description:
            "Why is financial literacy important for young adults? Discuss budgeting, saving, and investing basics.",
        tags: ["Economics", "Beginner", "🪙 90"],
        date: "Oct 9, 2025",
    },
    {
        id: 8,
        title: "Introduction to HTML and CSS",
        description:
            "Explain the role of HTML and CSS in web development. How do they work together to build a webpage?",
        tags: ["Computer Science", "Beginner", "🪙 85"],
        date: "Oct 8, 2025",
    },
    {
        id: 9,
        title: "The Human Brain and Memory",
        description:
            "How does the human brain store and recall information? Discuss short-term vs long-term memory.",
        tags: ["Neuroscience", "Intermediate", "🪙 110"],
        date: "Oct 7, 2025",
    },
    {
        id: 10,
        title: "Ethical Dilemmas in Technology",
        description:
            "Should companies be allowed to use AI for surveillance? Discuss the ethical implications.",
        tags: ["Ethics", "Advanced", "🪙 125"],
        date: "Oct 6, 2025",
    }
];

export const courses = [
    {
        id: 1,
        image: "/assets/courses/course_1.jpg", // Replace with actual course banner
        title: "BPSC TRE 4.0 – SST (9th to 10th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1554,
        originalPrice: 3885,
        discount: "60.00% off",
        buttonText: "View Details",
    },
    {
        id: 2,
        image: "/assets/courses/course_1.jpg",
        title: "BPSC TRE 4.0 – SST (6th to 8th and 9th & 10th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1777,
        originalPrice: 4443,
        discount: "60.00% off",
        buttonText: "View Details",
    },
    {
        id: 3,
        image: "/assets/courses/course_1.jpg",
        title: "BPSC TRE 4.0 – Maths & Science (6th to 8th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1443,
        originalPrice: 3608,
        discount: "60.01% off",
        buttonText: "View Details",
    },
    {
        id: 1,
        image: "/assets/courses/course_1.jpg", // Replace with actual course banner
        title: "BPSC TRE 4.0 – SST (9th to 10th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1554,
        originalPrice: 3885,
        discount: "60.00% off",
        buttonText: "View Details",
    },
    {
        id: 2,
        image: "/assets/courses/course_1.jpg",
        title: "BPSC TRE 4.0 – SST (6th to 8th and 9th & 10th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1777,
        originalPrice: 4443,
        discount: "60.00% off",
        buttonText: "View Details",
    },
    {
        id: 3,
        image: "/assets/courses/course_1.jpg",
        title: "BPSC TRE 4.0 – Maths & Science (6th to 8th)",
        subtitle: "New Batch Dec 2025 (Valid till Exam)",
        price: 1443,
        originalPrice: 3608,
        discount: "60.01% off",
        buttonText: "View Details",
    }
];

const ads = [
    "/assets/ads/ad_4.jpg",
    "/assets/ads/ad_3.jpg",
    // "/assets/ads/ad_1.jpg",
    // "/assets/ads/ad_2.jpg",
    // "/assets/ads/ad_5.jpg",
]
const Page = () => {
    return (
        <div className='bg-violet-50'>
            <Navbar />
            <div className='min-h-dvh'>
                <div className="flex flex-col md:flex-row justify-center gap-4 lg:gap-8 px-2 md:px-4 lg:px-8 pt-18 pb-2">
                    <div className='flex-1 min-w-0 lg:max-w-3xl'>
                        <Suspense fallback={<UserProfileSkeleton />}>
                            <UserProfile />
                        </Suspense>

                        {/* Question of the day Card component */}
                        <div className='select-none relative bg-gradient-to-br from-violet-600 via-violet-600 to-violet-400 rounded-xl min-h-36 text-white mt-4 p-0 transition-all duration-300 ease shadow-lg hover:scale-[1.03] hover:shadow-xl'>
                            <div className='px-4 pt-4'>
                                <p className='text-md text-white/60'>
                                    Question of the day
                                </p>
                                <div className='absolute top-5 right-4'>
                                    <Countdown />
                                    <p className='text-xs text-white/60 text-right mt-2'>Hours Remaining</p>
                                </div>

                                <h1 className='text-xl mt-0 max-w-[60%] leading-6'>
                                    Today's Topic: Current Affairs
                                </h1>
                            </div>
                            <img className='h-28 relative rotate-y-180' src="/assets/writing.svg" alt="" />
                            <Link href={'/question-of-the-day'} className='absolute bottom-4 right-4 inline-flex gap-1 bg-white text-violet-600 rounded-full py-2 px-3 font-medium'>
                                Answer Now <IconArrowRight stroke={1.5} />
                            </Link>
                        </div>

                        {/* Previous Questions */}
                        <Heading className="mt-6 px-2 border-b-2 pb-1 border-gray-300">Previous Questions</Heading>
                        {questions.map((question) => (
                            <PreviousQuestionsCard key={question.id} question={question} />
                        ))}
                    </div>
                    <div className='w-full md:w-72 md:flex-shrink-0 pt-18 md:pt-14 '>
                        <div className='w-full md:max-w-70 mx-auto px-4 md:px-'>
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RightSidebar = () => {
    const today = new Date();
    const month = today.getMonth(); // 0-indexed
    const year = today.getFullYear();

    return (
        <Fragment>
            <Testimonial />
            <div className='max-w-72 mx-auto'>
                <MonthCalendar
                    month={month}
                    year={year}
                    values={[
                        { date: "2025-10-01", count: 5 },
                        { date: "2025-10-05", count: 15 },
                        { date: "2025-10-12", count: 30 },
                    ]}
                    onDayClick={(iso, count) => console.log(iso, count)}
                />
            </div>
            {ads.map((path, index) => (
                <Ads key={index} path={path} />
            ))}
        </Fragment>
    )
}
// Separate component for user profile logic
const UserProfile = () => {
    const [imageError, setImageError] = useState(false)
    const { data: session, status } = useSession()

    // Show skeleton while loading
    if (status === 'loading') {
        return <UserProfileSkeleton />
    }

    // Handle unauthenticated state
    if (status === 'unauthenticated' || !session?.user) {
        redirect('/login', RedirectType.replace)
    }

    const user = session.user;
    console.log(user)


    const imageUrl = !imageError && user?.image ? user.image : '/assets/default_profile.png'

    return (
        <div className='flex gap-3 items-center w-full'>
            <Image
                className='object-cover rounded-full shadow-md'
                src={imageUrl}
                alt={user?.name || 'User avatar'}
                width={40}
                height={40}
                onError={() => setImageError(true)}
                priority={false}
            />
            <div className='flex flex-col justify-center gap-4'>
                <h1 className='text-md font-semibold leading-0'>{user?.name}</h1>
                <p className='text-xs text-gray-600 leading-0' >{user?.email}</p>

            </div>
            <div className='ml-auto space-x-2'>
                {/* <span className='bg-orange-100 py-2 px-2 rounded-full text-orange-500 shadow-[inset_0_0_0_2px_#fdba74] font-semibold text-sm'>
                    🔥 3 Days
                </span> */}
                <span className='inline-flex items-center gap-1 bg-gradient-to-b from-violet-500 to-violet-700 py-2 px-2 rounded-full text-white font-semibold text-sm'>
                    <img src="/assets/gem.png" alt="Gems" className='h-4' /> 2000 XP
                </span>
            </div>
        </div>
    )
}

// Enhanced skeleton with better animation
const UserProfileSkeleton = () => {
    return (
        <div className='flex gap-3 items-center animate-pulse'>
            <div className='h-10 w-10 bg-gray-300 rounded-full' />
            <div className='flex flex-col justify-center gap-2 flex-1'>
                <div className="w-40 h-4 bg-gray-300 rounded" />
                <div className="w-52 h-3 bg-gray-300 rounded" />
            </div>
            <div className="w-20 h-8 bg-gray-300 rounded-full" />
        </div>
    )
}

function Countdown({ targetDate }) {
    // here i want that if the user dont give a target date then it should take the next midnight as the target date
    const now = new Date();
    if (!targetDate) {
        now.setHours(24, 0, 0, 0);
        targetDate = now;
    }
    const hoursRef = useRef(null);
    const minutesRef = useRef(null);
    const secondsRef = useRef(null);

    useEffect(() => {
        const target = new Date(targetDate).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.max(0, target - now);

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            // Directly update DOM
            if (hoursRef.current) hoursRef.current.textContent = String(hrs).padStart(2, "0");
            if (minutesRef.current) minutesRef.current.textContent = String(mins).padStart(2, "0");
            if (secondsRef.current) secondsRef.current.textContent = String(secs).padStart(2, "0");

            if (diff <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-1 items-center text-violet-600 text-sm font-semibold rounded-xl w-max">
            <div className="flex flex-col items-center justify-center bg-white w-7 aspect-square rounded-lg shadow">
                <div ref={hoursRef}>00</div>
            </div>
            <span className='text-white font-semibold'>:</span>
            <div className="flex flex-col items-center justify-center bg-white w-7 aspect-square rounded-lg shadow">
                <div ref={minutesRef}>00</div>
            </div>
            <span className='text-white font-semibold'>:</span>
            <div className="flex flex-col items-center justify-center bg-white w-7 aspect-square rounded-lg shadow">
                <div ref={secondsRef}>00</div>
            </div>
        </div>
    );
}

export default Page