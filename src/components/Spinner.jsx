import React from 'react'

const Spinner = ({ className }) => {
    return (
        <div className={"animate-spin rounded-full h-5 w-5 border-3 border-b-transparent " + className}></div>
    )
}

export default Spinner