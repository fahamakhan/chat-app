const users = []

const addUser = (({id,username,room})=>{

    //Cleaning the data
     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {error: 'User and room are required'}
    }

    //Check the data
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })

    //If found return error
    if(existingUser){
        return {
            error: 'User already exists'
        }
    }

    //Create a new user
    const user = {id,username,room}
    users.push(user)
    return{user}


})

const removeUser = (id)=>{
    const user = users.findIndex(user => user.id === id)

    if(user !== -1){
        return users.splice(user,1)[0]
    }
}

const getUser = (id)=>{
    const user = users.find(user => user.id === id)
    return  user 
}

const getUserinRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter(user => user.room===room)

}

module.exports = {
    getUser,
    getUserinRoom,
    removeUser,
    addUser
}


