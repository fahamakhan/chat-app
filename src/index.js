const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const {generateMessages,generateLocationMessages} = require('../utils/messages')
const { addUser , removeUser , getUser, getUserinRoom } = require('../utils/users')
const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count = 0
io.on('connection',(socket)=>{

    

    socket.on('join',({username,room},callback)=>{
        const {error , user} = addUser({id:socket.id , username , room})

        if(error){         
         return callback(error)
        }
        socket.join(user.room)
        const message = 'Welcome!'
        socket.emit('message',generateMessages('Admin',message))

        socket.broadcast.to(user.room).emit('message',generateMessages('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserinRoom(user.room)
        })
        callback()

    })

    socket.on('sendMessage',(messagee,callback)=>{
        const user =  getUser(socket.id)
       
        io.to(user.room).emit('message',generateMessages(user.username,messagee))
        callback()
    })

    socket.on('sendlocation',(coord,callback)=>{
        const user = getUser(socket.id)
        const { latitude, longitude} = coord
        io.to(user.room).emit('locationMessage',generateLocationMessages(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location Delivered')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
        io.to(user.room).emit('message',generateMessages('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserinRoom(user.room)
        })
        }
    })
})

server.listen(PORT,()=>{
    console.log(`Server is up on port ${PORT}`)
})