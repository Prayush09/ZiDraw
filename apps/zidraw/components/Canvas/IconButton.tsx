import React from 'react';

export function IconButton({
    icon, onClick, activated
}: {
    icon: React.ReactNode,
    onClick: () => void,
    activated: boolean
}){
    return <div className={`m-2 p-2 cursor-pointer rounded-full bg-black hover:bg-gray 
    ${activated ? "text-red-200" : "text-white"} `} onClick={onClick}>
        {icon}
    </div>
}