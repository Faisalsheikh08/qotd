import React from 'react'

const Heading = ({ children, className }) => {
    return (
        <h1 className={`font-semibold text-2xl ${className}`}>{children}</h1>
    )
}

export default Heading