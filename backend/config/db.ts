import dotenv from 'dotenv'
import { Pool,  PoolConfig, PoolClient, Client} from 'pg'

dotenv.config()

function getRequiredEnvVar(name : string) {
    const value = process.env[name]
    if(!value){
        throw new Error(`Variável de ambiente ${value} não definida.`)
    }

    return value
}

const dbConfig : PoolConfig = {
    user: getRequiredEnvVar('DB_USER'),
    host: getRequiredEnvVar('DB_HOST'),
    password: getRequiredEnvVar('DB_PASSWORD'),
    database: getRequiredEnvVar('DB_NAME'),
    port: parseInt(process.env.DB_PORT || '5432')
}

export const pool = new Pool(dbConfig)
 
pool.on('connect', () => {
    console.log('Conected to database')
    console.log(`Total conections: ${pool.totalCount}`)
})

pool.on('release', () => {
    console.log('Disconnected from the database')
})

