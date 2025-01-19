import express from 'express';
import jwt from 'jsonwebtoken'
import {middleware} from './middleware'
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/zod';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db-package/prisma';


const app = express();

app.use(express.json());

app.post("/api/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
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

    //@ts-ignore TODO; fix this
    const userId = req.userId
    console.log(userId);
    //TODO: Send DB the cred to create a room!!
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
            roomId: room.id
        });
    } catch(error){
        res.status(500).json({message: "Room was not created due to an error: ", error: error});
    }
})

app.listen(3001, () => {
    console.log("Server started at 3001");
});