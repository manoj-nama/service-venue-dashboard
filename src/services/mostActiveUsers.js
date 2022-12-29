const UserModel = require('../models/users');

module.exports.getMostActiveUser = async () => {
    const allActiveUsers = await UserModel.find({ currentState:1 });
    console.log('d,f.d,f.df.',allActiveUsers.length);
    const ActiveUserObject = allActiveUsers.reduce((acc,users)=>{
        const venueId = users.venueId;
        const sameVenue = acc[venueId] ?? [];

        return {...acc,
                [venueId]:[
                    ...sameVenue,
                    users
                ]
        };
    },{})
    console.log('kdlfldfldd',Object.keys(ActiveUserObject).length);
    const ActiveUserInVenue = [];
    for(const key in ActiveUserObject){
        const venueObj = ActiveUserObject[key];
        const obj = {
            "venueId":venueObj[0].venueId,
            "venueName":venueObj[0].venueName,
            "active_users":venueObj.length,
            "venueType":venueObj[0].venueType,
            "venueState":venueObj[0].venueState
        }
        ActiveUserInVenue.push(obj);
    }
    
    ActiveUserInVenue.sort(function(a,b){
        return a.active_users-b.active_users > 0 ? -1 : 1;
    });

    return ActiveUserInVenue;
}