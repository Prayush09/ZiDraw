import React from 'react';

export function IconButton({
    icon, onClick, activated, name, className
}: {
    icon: React.ReactNode,
    name?: string,
    onClick: () => void,
    activated: boolean,
    className?: string
}){
    return <div className={`flex flex-col bg-transparent items-center justify-center m-2 p-2 cursor-pointer rounded-full bg-black hover:bg-gray text-xs
    ${activated ? "text-red-200" : "text-white"} ${className}`} onClick={onClick}>
        {icon}
        {name}
    </div>
}