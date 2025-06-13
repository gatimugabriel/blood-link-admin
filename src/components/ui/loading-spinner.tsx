import React from 'react';

export const LoadingSpinner = ({fullScreen = false} ) => {
    return (
        <div className={`w-screen ${fullScreen ? 'h-screen' : 'h-full'} flex justify-center items-center`}>
            <div className={`
                w-full h-full flex justify-center items-center
                bg-black bg-opacity-50
            `}
            >
                <div className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white`}></div>
            </div>
        </div>
    )
};
