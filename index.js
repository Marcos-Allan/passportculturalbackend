const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
let code
const smtp = nodemailer.createTransport({
    host: process.env.HOST_GMAIL,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.CODE_EMAIL,
    }
})
function randomNumber(){
    return Math.floor(Math.random() * 10)
}
function sendEmail(emailReceiver, code) {
    smtp.sendMail({ 
        from: "Allan Menezes <allanmenezes880@gmail.com>",
        to: emailReceiver,
        subject: "recuperação de senha da sua conta do Cultural Passport",
        html: `<h1>Código de confirmação ${code}</h1>`,
        text: `Código de confirmação ${code}`
    })
    .then(() => {
        console.log("Email enviado com sucesso!")
        return
    }).catch((error) => {
        console.log("Algo deu errado no envio do email: ", error)
        return
    })
}
const avatares = [
    'https://static.wikia.nocookie.net/ben10/images/1/18/Arraia-%C3%A0-Jato_Pose.png/revision/latest/scale-to-width-down/250?cb=20210111002428&path-prefix=pt',
    'data:image/jpeg;base64,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',
    'https://static.wikia.nocookie.net/ben10/images/5/54/BalaDeCanh%C3%A3oB105.png/revision/latest?cb=20140718173315&path-prefix=pt',
    'data:image/jpeg;base64,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A86m4PYobZ31WL/3dy/DPzlhngLYWGQE9wEREBITWqpRXDt9oXaByUfe2rZFTwI5yZY2zPCcl1k0ua9VmJ8CkhRwC8+53wIWxZWRvesRfgQdxkpg6xsjtvQlGHINbZYHiN3r0mPCYIuQzZC3mZY9BaFNasWItSUU7/mZWZgo/pv0hF30WhWjTDbwi3vwy3eW6bkRCkREBERAREQEREBERA18am1TdeaMPUESvamaNZENaqpV3AAVhZlUW3jgSc7dpaYgIiICIiAiIgROs1TZwmIINv5T58rgi85NgKQqVL71UAjlcXvb4ZztOIoq6sji6uCpB3EEWI9JyPSWiXw7utUXG9d4VlByUHrlfqOUCc0PgziGKofAvvONy/lXm3wHHlL/AIbDrTUIgsqiw/c9ZXdSwAtQAAe54RwyPKWmAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgJo6T0bTxCbFVbjeDxB3XE3ogVfR2rtSg96daybt12K77EMCLy0REBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERA//2Q==',
    'https://static.wikia.nocookie.net/ben10/images/c/cd/MassaPose.png/revision/latest/scale-to-width-down/250?cb=20130724230118&path-prefix=pt'
]
async function hashPassword(password) {
    try {
        return await argon2.hash(password);
    } catch (err) {
        throw new Error('Erro ao hashear a senha');
    }
}
async function verifyPassword(hash, password) {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        throw new Error('Erro ao verificar a senha');
    }
}
function sortAvatar(array) {
    const indice = Math.floor(Math.random() * array.length)
    return array[indice]
}
require('dotenv').config()
const port = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.json())
const Person = mongoose.model('Person', {
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    }
});
app.post('/signup', async (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    const img = req.body.img || sortAvatar(avatares)
    if(!email){ 
        res.send('Por favor infomre o email')
        return
    }
    if(!name){
        res.send('Por favor informe o seu nome')
        return
    }
    if(!password){
        res.send('Por favor informe uma senha')
        return
    }
    const person = await Person.findOne({ email: email })
    if(person){
        res.send('Usuário já cadastrado com esse email')
        return
    }else{
        const passwordHash = await hashPassword(password)
        const person = new Person({
            name: name,
            email: email,
            password: passwordHash,
            img: img
        });
        await person.save()
        res.send(person)
        return
    }
})
app.post('/signin', async (req, res) => {
    const emailPesq = req.body.email
    const password = req.body.password
    if(!emailPesq){
        res.send('Por favor insira um email')
        return
    }
    if(!password){
        res.send('Por favor insira sua senha')
        return
    }
    const person = await Person.findOne({ email: emailPesq })
    if(person){
        if(person.password){
            const checkPassword = await verifyPassword(person.password, password)
            if(checkPassword){
                const secret = process.env.SECRET
                res.send(person)
            }else{
                res.send('Senha incorreta')
            }
        }else{
            res.send('Usuário cadastrado com a conta do google')
            return
        }
    }else{
        res.send('Usuario não encontrado no sistema')
    }
})
app.post('/signin_google', async (req, res) => {
    const emailPesq = req.body.email
    const name = req.body.name
    const img = req.body.img || sortAvatar(avatares)
    if(!emailPesq){
        res.send('Por favor insira um email')
        return
    }
    if(!name){
        res.send('Por favor insira um nome')
        return
    }
    const person = await Person.findOne({ email: emailPesq })
    if(person){
        res.send(person)
    }else{
        const person = new Person({
            name: name,
            email: emailPesq,
            img: img
        });
        await person.save()
        res.send(person)
    }
})
function ckeckToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        res.send('Acesso negado man')
    }
    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch (error) {
        res.send('token invalido')
    }
}
app.get('/user/:id', ckeckToken, async (req, res) => {
    const id = req.params.id
    const person = await Person.findById(id, '-password')
    if(person){
        res.send(person)
    }else{
        res.send("Usuário não encontrado")
    }
})
app.get('/', (req, res) => {
    res.send('/teste')
})
app.get('/forgoutpassword/:email', async (req, res) => {
    const email = req.params.email
    const person = await Person.findOne({ email: email })
    if(person){
        code = `${randomNumber()}${randomNumber()}${randomNumber()}-${randomNumber()}${randomNumber()}${randomNumber()}`
        sendEmail(email, code)
        res.send('Código enviado para o email informado')
        return
    }else{
        res.send('Usuário não encontrado')      
        return
    }
})
app.get('/verifycode/:code', async (req, res) => {
    const codeUser = req.params.code
    if(code == codeUser){
        res.send('Código de verificação correto')
        return
    }else{
        res.send('Código de verificação errado')
        return
    }
})
app.get('/users', async (req, res) => {
    const person = await Person.find()
    res.send(person)
})
app.get('/users/:email', async (req, res) => {
    const email = req.params.email
    const person = await Person.findOne({ email: email })
    if(person){
        res.send(person)
        return
    }else{
        res.send('Usuário não encontrado')      
        return
    }
})
app.put('/users/update/:id', async (req, res) => {
    const id = req.params.id
    const name = req.body.name
    const img = req.body.img
    const person = await Person.findByIdAndUpdate(id, {name, img}, { new: true })
    res.send(person)
})
app.delete('/users/delete/:id', async (req, res) => {
    const id = req.params.id
    const person = await Person.findByIdAndDelete(id)
    res.send(person)
})
app.listen(port, () => {
    mongoose.connect(process.env.MONGODB_URI);
    console.log('servidor rodando')
})