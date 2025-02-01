import express from 'express';
import jwt from 'jsonwebtoken'
import {middleware} from './middleware'
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/zod';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db-package/prisma';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors({origin: 'http://localhost:3000'}));

app.post("/api/signup", async (req, res) => {
    console.log(req.body)
    const parsedData = CreateUserSchema.safeParse(req.body);
    console.log(parsedData.data);
    if(!parsedData.success){
        res.json({
            message: "Incorrect inputs",
            parsedData
        })
        return;
    }

    //TODO: hash the password before sending it to the DB
    const user = await prismaClient.user.create({
        data: {
            name: parsedData.data.name,
            password: parsedData.data.password,
            email: parsedData.data.email
        }
    })


    res.status(201).json({
        message: "user created",
        userId: user.id
    });
});


app.post("/api/login", async (req, res) => {
    const pdata = SignInSchema.safeParse(req.body);

    if(!pdata.success){
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where:{
            email: pdata.data.email,
            password: pdata.data.password

        }
    })

    if(!user){
        res.status(401).json({
            message: "Invalid credentials"
        });
        return;
    }

    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET);

    res.status(200).json({message: "successfully logged in!", token});
});

app.post("/api/create-room", middleware, async (req, res) => {
    const pdata = CreateRoomSchema.safeParse(req.body);

    if(!pdata.success){
        res.json({
            message: "Incorrect inputs"
        })
        return;
    };

    //@ts-ignore 
    const userId = req.userId
    console.log(userId);
    try
    {
        const room = await prismaClient.room.create({
            data: {
                slug: pdata.data.name,
                adminId: userId
            }
        })

        res.status(201).json({
            message: "room created",
            data: {
                roomId: room.id
            }
        });
    } catch(error){
        res.status(500).json({message: "Room was not created due to an error: ", error: error});
    }
})

app.get("/api/chats/:roomId", middleware, async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/api/room/:slug", middleware, async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    console.log(room);
    res.json(room);
})

app.post("/api/chat/delete", middleware, async (req, res) => {
    console.log("controller here!")
    const roomId = Number(req.body.roomId);
    try{
    const result  = await prismaClient.chat.deleteMany({
        where: {
            roomId: roomId
        }
    })

    console.log("Canvas is cleared");
    res.json({
        message: "Cleared the canvas",
        result
    })
    } catch(err){
        console.error(err);
        res.status(409).json({
            message: "something went wrong"
        })
    }
})


app.listen(3001, () => {
    console.log("Server started at 3001");
});


