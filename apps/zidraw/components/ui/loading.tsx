"use client"
import { Blocks } from 'react-loader-spinner';

export default function Load(){
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
            <Blocks
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                visible={true}
            />
                <p className="text-white text-lg font-medium animate-pulse">
                    LOADING
                </p>
            </div>
        </div>
    );
}