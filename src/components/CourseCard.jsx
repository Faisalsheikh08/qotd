const CourseCard = ({ course }) => {
    return (
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            {/* Image */}
            <img
                src={course.image}
                alt={course.title}
                className="w-full object-cover"
            />

            {/* Content */}
            <div className="p-4">
                <h3 className="text-md font-semibold text-gray-800">{course.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.subtitle}</p>

                {/* Price Section */}
                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <p className="text-md font-bold text-gray-800">₹{course.price}</p>
                        <p className="text-xs line-through text-gray-400">₹{course.originalPrice}</p>
                    </div>
                    <p className="text-md font-semibold text-green-600">{course.discount}</p>
                </div>

                {/* CTA */}
                <button className="w-full mt-4 bg-violet-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-violet-700 transition cursor-pointer">
                    {course.buttonText}
                </button>
            </div>
        </div>
    );
};

export default CourseCard;