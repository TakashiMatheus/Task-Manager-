import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { pool } from './config/db';
import { Result } from 'pg';

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors({credentials:false}))

app.use(router)

router.get('/catinga', async (req: Request, res: Response) => {
        let client
        try{
            client = await pool.connect()
            const result = await client.query('SELECT * FROM "User"')
            res.status(200).json({
                status:'success',
                data: result
            })
        }catch(err){
            console.log(err)
            res.status(500).json({
                status:'error',
                message:'Falha ao acessar o banco de dados.'
            })
        }finally{
            if(client) client.release()
        
    }
})


app.listen(PORT, ()=> {
    console.log(`O servidor está rodando na porta ${PORT}`)
})