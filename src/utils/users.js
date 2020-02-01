const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {

    //clean data
    username = username.trim();
    room = room.trim();

    //validate

    if (!username || !room) {
        return {
            error: `Username and room are required fields`
        }
    }

    // check if already exists
    let existingUser = users.find(user => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: `User ${username} already exists in ${room}`
        }
    }
    let user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    // findIndex will stop searching if the match is found
    let userExists = users.findIndex((val) => val.id == id);
    console.log(userExists);
    if (userExists == -1)
        return { error: `Invalid user id` };
    let user = users.splice(userExists, 1)[0];    
    return { user };
}

const getUser = (id) => {
    return users.find(user => user.id == id);
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room == room)
}

module.exports = {
    getUsersInRoom,
    getUser,
    addUser,
    removeUser
}