
const ftp = require('basic-ftp');
const fs = require('fs');
const cus_modules = require('./CUSTOM_MODULES');
fileTransfer2G();
console.log(cus_modules.dateFunction());
const date = new Date();
const curHour = date.getHours();
const curMin = date.getMinutes();


async function fileTransfer2G(){
    const client = new ftp.Client();
    client.ftp.verbose = true;
    let files = []; // tmp Array to store the name of files to delete
    fs.readdir(`/home/u2000/home/u2000/NBI_PM/pm/pmexport_${cus_modules.dateFunction()}`,async (err,data)=>{
        try{
            // <*2G*KPI*TEMP*.csv>
            // 'HOST03_pmresult_30_202104121100_202104121130_PURA 3G KPI TEMPLATE(bis).csv'
            // 'HOST03_pmresult_60_202104120000_202104120100_PURA 2G KPI TEMPLATE.csv'
		if(err){
 const errorMessage = "<b>Please be informed that The folder from which 2G files are to be copied to the PURA FTP Server for today has not yet been created.</b><br/>"+
        "<b> Thank you.</b>";
		if(cus_modules.detEmailSent()){
			// Error to Log in the Error Log Files
			cus_modules.errorLogging(1,`Error. /pmexport_${cus_modules.dateFunction()} Folder not found @ ${date}\n`);
         		await cus_modules.sendMail(errorMessage); // send email notification. 
		}
			process.exit(1);
		}
            let regex = /[a-zA-Z0-9_]*PURA 2G[ a-zA-Z0-9_()]*TEMP[a-zA-Z0-9]*.csv/; // Regular Epression to get all files with 3G 
    
            if(data){
                // Go through all files in the current Directory to get the file names.
                data.map((d)=>{
                    let flag = d.match(regex);
                    // add file to tmp array if it is a 3g csv file
                    if(flag){
                        files.push(d);
                    }
                });
            }
            
        }catch(err){
 const errorMessage = "<b>Please be informed that The folder from which 2G files are to be copied to the PURA FTP Server for today has not yet been created.</b><br/>"+
        "<b> Thank you.</b>";
		if(cus_modules.detEmailSent()){
			// Error to log into the error log file.
			cus_modules.errorLogging(1,`Error. /pmexport_${cus_modules.dateFunction()} Folder not found @ ${date}\n`);
         		await cus_modules.sendMail(errorMessage); // send email notification. 
		}
			process.exit(1);
            // handling case when folder doesn't exist. 
            console.error("Sorry no such file");
            
        }
    });
    let counter = 0;
    try{
        // Connecting to File  FTP server
        await client.access({
            host:"10.223.99.3",
            user:"qcellhuawei2g",
            password:"huawei2g",
            // secure:true
        });
    }
    catch(error){
        // Error Handling when the SErver is down for first connect Attempt

        console.log("Error... Server Cannot be reached.");
        // Custom message to be sent as params for the email notification
        const errorMessage = "<b>Please be informed that The Pura FTP Server cannot be reached.</b><br/>"+
        "<b> Thank you.</b>";
	cus_modules.errorLogging(1,`Error. CONNECTION TO SERVER GOT INTERRUPTED WHILE COPYING FILES @ ${date}\n`);
        await cus_modules.sendMail(errorMessage); // send email notification. 
        process.exit(1); // quit the application. no need to proceed. SErver already down. 
    }

    const filePath = `/home/u2000/home/u2000/NBI_PM/pm/pmexport_${cus_modules.dateFunction()}`; // ☚ Directory to process
    let file2Delete = ""; // TEMP VARIABLE TO STORE FILE NAME TO DELETE.

    // Pfocessing all files
    /*
    @ THE WHILE LOOP TRIES TO SEND ALL FILES 
    @ IN THE EVENT THERE THE SERVER WENT DOWN WHILE SOME FILES ARE NOT SENT, QUIT LOOP & SEND EMAIL
    */
    while(true){
        try{
            for(let i = 0; i<files.length; i++){
                let fileToMove = filePath+"/"+files[i];
                //console.log("sdfs");
                await client.uploadFrom(fileToMove, files[i]);// ☚ MOving files to ftp server
		cus_modules.errorLogging(2,`${fileToMove} SUCCESSFULLY COPIED. @ ${date}\n`);
                file2Delete = files.splice(i,1)[0]; // ☚ Removing Files from the temp Array
                // ☟ MOVING FILES TO A BACKUP FOLDER 
                cus_modules.fileBackup(`/home/u2000/home/u2000/NBI_PM/pm/pmexport_${cus_modules.dateFunction()}/${file2Delete}`,file2Delete,`/home/u2000/ftpFileBackUp/pura_${cus_modules.dateFunction()}`);// BACKING UP FILES
            }
            if(files.length == 0){
                break; //☚ all files are processed without error. kill (Stop) outer loop 
            }
        }catch(err){
            counter ++;
            if(counter == 5){
                break; // ☚ quit application after 5 attemts.
            }
        }
    }

    /*
    @ SEND EMAIL ERROR NOTIFICATION IF THE SERVER WENT DOWN WHILE SOME FILES ARE NOT SENT. 
    */
    if(files.length > 0){
        // EMAIL ERROR MESSAGE
        const errorMsg = "<b>Please be informed that There Are some Files Tht couldn't be transfered to the via ftp to the Pura Server.</b>"+
        "<br/><b>Please check the Network Connection issue To ensure these files are successfully sent. Thank you.</b>";
        cus_modules.sendMail(errorMsg); // SENDING EMAIL
    }
    client.close();  // TERMINATE FTP SERVER
}
