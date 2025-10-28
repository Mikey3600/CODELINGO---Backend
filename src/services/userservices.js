


export const getUserByIdService = async (userId) => {
    console.log(`[UserService] Attempting to fetch user with ID: ${userId}`);
    
    
    if (userId === '12345') {
        
        return { 
            id: '12345', 
            username: 'testuser', 
            email: 'test@example.com',
           
        };
    }
    return null;
};


export const updateUserService = async (userId, updates) => {
    console.log(`[UserService] Attempting to update user ${userId} with data:`, updates);
    
    
    if (userId === '12345') {
        
        return { 
            id: '12345', 
            username: updates.username || 'testuser', 
            email: updates.email || 'test@example.com' 
        };
    }
    return null;
};


export const deleteUserService = async (userId) => {
    console.log(`[UserService] Attempting to delete user with ID: ${userId}`);
    
   
    if (userId === '12345') {
        return true; 
    }
    return false;
};