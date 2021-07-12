const nodemailer = require("nodemailer");
const fs = require('fs');


/*
  @FILE BACKUP MODULE
*/
const fileBackup = (sourceName,destinationName,destinationFolder)=>{
  fs.readdir(destinationFolder,(err)=>{
    if(err){
      // CREATE FOLDER IF NOT EXIST AND MOVE FILES
      fs.mkdir(destinationFolder,(err)=>{
        if(err){
          console.log("Error unable to create folder in this directory.");
        }
        else{
          // MOVING FILES TO DESTINATION
          fs.rename(sourceName,`${destinationFolder}/${destinationName}`,(err)=>{

          })
        }
      })
    }
    else{
      // FOLDER ALREADY EXISTS. MOVE FILE.
      // MOVING FILES TO DESTINATION
      fs.rename(sourceName,`${destinationFolder}/${destinationName}`,(err)=>{
        if (err){
          console.log("Error Sorry NO such file exists.");
        }
        else{
          console.log("File Successfully Sent. Thank you.");
        }
      });
    }
  })


};
/*
  @ Send Email notification with custom message
  */
const sendMail = async (message)=> {
  let transporter = nodemailer.createTransport({
    host: "webmail.qcell.gm",
	  /*
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "testmailsend363@gmail.com", // generated ethereal user
      pass: "sendmail_123", // generated ethereal password
    },
	  */
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "apps@qcell.gm", // sender Email
     pass: "#h9Yml@57Yportal", // email password
    },
  });

  // send mail with defined transport object
	console.log("Sending Email");
  await transporter.sendMail({
    from: 'apps@qcell.gm', // sender address
    to:"swat@qcell.gm",
	//to: "lamin.touray1@qcell.gm,lo2raymoori@gmail.com", // list of receivers
    subject: "Error 🙋", // Subject line
    html: message, // html body

  });
}

/*
  @CUSTOM FUNCTION FOR DATE GENERATION // 20210311
*/
const  dateFunction = ()=>{
  const date = new Date();
  const monthIndex = date.getMonth()+1;
  const month = monthIndex <= 9 ? "0"+monthIndex : monthIndex;
  const day = date.getDate() <=9 ? "0"+date.getDate() : date.getDate();
  return `${date.getFullYear()}${month}${day}`;
}


const detMsgSent = ()=>{
  const dateHandle = new Date();
    const curHour = dateHandle.getHours();
	//console.log(curHouri+"~~~~~~~~~~~~~~~~~");
    if(curHour != 0 && curHour !=1 && curHour !=2 ){
    return true;
}
  return false;
}

const logMsgs = (flag,data)=>{
	let path = "";
	if(flag ===1){
		path = "/var/log/errorPura.log";
	}
	else{
		path = "/var/log/successPura.log";
	}
	fs.writeFileSync(path,data,{flag:"a+"});
	
		
}


// EXPOSING CUSTOM FUNCTIONS TO OTHER FILES. 
module.exports = {
  sendMail : sendMail,
  dateFunction : dateFunction,
  fileBackup : fileBackup,
  detEmailSent : detMsgSent,
  errorLogging : logMsgs
}
