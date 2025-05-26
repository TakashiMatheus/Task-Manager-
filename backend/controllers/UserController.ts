import * as bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET as string

interface Register {
    name: string;
    email: string;
    password: string;
}

interface Login {
    email: string;
    password: string;
}


// Generate user token 

export const generateToken = (id : number) : string => {
    return jwt.sign({id}, jwtSecret, {
        expiresIn: "7d",
    })
}

// Register an user and Sign in
export const register = async(req : Request, res :Response) => {
    const client = await pool.connect()
    const user: Register = req.body


    try{
        // Check if user Exisists
        const users = await client.query('SELECT email FROM "User" WHERE email = $1',[user.email])

        if(users.rows.length > 0) {
            res.status(422).json({errors: ["E-mail já cadastrado."]})
            return
        }

        // Generate password hash
        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(user.password, salt)

        // Create user

        await client.query('INSERT INTO User(name, email, password) VALUES($1, $2, $3)', [user.name, user.email, passwordHash])

        res.status(201).json({ message: "Usuário Cadastrado com Sucesso!"});
    }catch(error){
        console.log("Erro no registro: ", error)
        res.status(500).json({error: "Erro no registro."})
    }finally{
        client.release()
    }
}

// SIgn user in 
export const login = async(res:Response, req:Request) => {
    const client = await pool.connect();
    const reqUser : Login  = req.body;
    try{
        // check if user exists
        const user = await client.query('SELECT email, password FROM "User" WHERE email = $1', [reqUser.email])
        if(user.rows.length === 0){
            res.status(404).json({errors: ["Usuário não encontrado."]})
            return
        }

        const hashedPassword = user.rows[0].password

        const isPasswordValid = await bcrypt.compare(reqUser.password, hashedPassword)

        // Check if password matches
        if(!isPasswordValid){
            res.status(401).json({ errors: ["Senha incorreta"]})
            return
        }

        const userData = {
            email: user.rows[0].email,
            id: user.rows[0].id
        }

        res.json({user: userData})

    }catch(error){
        console.log("Erro no login: ", error)
        res.status(500).json({error: "Erro no Login."})
    }finally{
        client.release()
    }
}

export const getCurrentUser = async(req: Request, res: Request) => {
    const user = req.user // continuar daqui
}