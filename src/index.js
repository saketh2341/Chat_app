const express=require('express')
const path=require('path')
const app=express()
const http=require('http')
const socketio=require('socket.io')
const {generatemessage,generatelocationmessage}=require('./utils/messages')
const {adduser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const port=process.env.PORT || 3000
const publicdirectorypath=path.join(__dirname,'../public')
const server=http.createServer(app)
const io = socketio(server)


app.use(express.static(publicdirectorypath))

// app.get('/' , (req,res) =>{
//     res.render('public/index.html')
// })



io.on('connection', (socket) =>{
    console.log('new websocket connection')


    socket.on('join', ({username,room},callback) =>{
        const {error,user} =adduser({id:socket.id, username,room})
        
        if(error){
          return callback(error)
        }
        socket.join(user.room)

        socket.emit('message',generatemessage('Admin','welcome!'))
        socket.broadcast.to(user.room).emit('message',generatemessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendmessage', (message,callback) =>{
        
        const user=getUser(socket.id)

        if(user)
        {
            io.to(user.room).emit('message', generatemessage(user.username,message))
            callback()
        }
      
    })
    socket.on('send location',(position,callback) =>{
       
       const user=getUser(socket.id)
       if(user)
       {
        io.to(user.room).emit('send location',generatelocationmessage(user.username, `http://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
       }
       
    })
    socket.on('disconnect', () =>{
        const user=removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message',generatemessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
})



server.listen(port , () =>{
    console.log('server is up on' + port)
})