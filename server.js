var express = require("express");

var app = express();

app.listen(2006, function () {
    console.log("Server Started");
})
//Gen_Ai
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AQ.Ab8RN6IYaP-TXIQxpal_UJU4kZGrPYsOsJRZP2pAufyOzm6ZRg");
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });


app.use(express.static("public"));


app.get("/", function(req, resp){
    resp.sendFile(__dirname + "/public/index.html");
});
//=========MYSQL=========================
   var mysql = require("mysql2");
   require("dotenv").config();

    let url=process.env.AIVEN_URL;
        let mysqlCon=mysql.createConnection(url);
        mysqlCon.connect(function(err){
                if(err==null)
                    console.log("Connected Successfully");
                else
                    console.log(err.message);
        })
//============
//File uploader
var fileuploader = require("express-fileupload");
app.use(fileuploader());
app.use(express.urlencoded(true));
var cloudinary=require("cloudinary").v2;
cloudinary.config({
            cloud_name:process.env.CLOUD_NAME, 
            api_key:process.env.CLOUD_API, 
            api_secret:process.env.CLOUD_KEY // Click 'View API Keys' above to copy your API secret
        });

//========AJAX================
app.get("/check-email", function (req, resp) {
    let email = req.query.emailKuch;
    mysqlCon.query("select *  from userspro where emailid=?", [email], function (err, resultJSONAry) {

        if (err == null) {
            if (resultJSONAry.length == 1)
                resp.send("Already Occupied");
            else
                resp.send("Available");
        }
        else
            resp.send(err.message);

    })
})
app.get("/signup-process", function (req, resp) {

    let email = req.query.emailKuch;
    let pwd = req.query.pwdKuch;
    let utype = req.query.utypeKuch;


    mysqlCon.query("insert into userspro values(?,?,?,current_date(),1)", [email, pwd, utype], function (err) {

        if (err == null)
            resp.send("Signup successfully!!");
        else
            resp.send(err.message);
    })
});

app.get("/login-process", function (req, resp) {

    let email = req.query.emailKuchlogin;
    let pwd = req.query.pwdKuchlogin;

    mysqlCon.query("select * from userspro where emailid=? and pwd=?", [email, pwd], function(err,resultJSONAry) {

        if (err == null){
            if (resultJSONAry.length == 1){
                if(resultJSONAry[0].active==1)
                    resp.send(resultJSONAry[0].utype);
                else
                    resp.send("Invalid User ID or Password");
            }
            else
             resp.send("Invalid User ID or Password");
        }
        else
            resp.send(err.message);
    })
})
//=================DONOR==Linking===
app.get("/donorprofile", function(req, resp) {
    var path=__dirname+"/public/donor-profile.html";
        resp.sendFile(path);
});
app.get("/availmed", function(req, resp) {
    var path=__dirname+"/public/availmed.html";
        resp.sendFile(path);
});
app.get("/availEquip", function(req, resp) {
    var path=__dirname+"/public/availEquip.html";
        resp.sendFile(path);
});
//=========DONOR SEND DATA==================
app.post("/send-data",async function(req,resp){
    
    
    //File uploading
    let msg="File Not Uploaded";
    let myUrl="nopic.jpg";


    if(req.files!=null)
    {
        let fileName=req.files.acard.name;//uploaded files goes in file object 
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.acard.mv(fullPath);//saving pic in upload folder
        msg="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        })
    }
    //File uploading
    let msg2="File Not Uploaded";
    let myUrl2="nopic.jpg";


    if(req.files!=null)
    {
        let fileName2=req.files.profilePic.name;//uploaded files goes in file object 
        let fullPath2=__dirname+"/uploads/"+fileName2;
        await req.files.profilePic.mv(fullPath2);//saving pic in upload folder
        msg2="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath2).then(function(picUrlResult2)
        {
            myUrl2=picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
        })
    }
    //===========
    let emailid=req.body.inputEmail;
    let name=req.body.inputName;
    let mobile=req.body.inputMobile;
    let address=req.body.inputAddress;
    let city=req.body.inputCity;

    //=======
    mysqlCon.query("insert into dprofiles values(?,?,?,?,?,?,?)",[emailid,name,mobile,address,city,myUrl,myUrl2],function(err){
            
        if(err==null)
            resp.sendFile(__dirname+"/public/response.html");
        else
            resp.send(err.message);
    })

})
//========MODIFY-UPDATE==================
app.post("/modify-data",async function(req,resp){
    
    
    //File uploading
    let msg="File Not Uploaded";
    let myUrl="nopic.jpg";


    if(req.files!=null && req.files.acard!=null)
    {
        let fileName=req.files.acard.name;//uploaded files goes in file object 
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.acard.mv(fullPath);//saving pic in upload folder
        msg="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        })
    }
    else
    {
            myUrl=req.body.hdnAadhar;
    }
    //File uploading
    let msg2="File Not Uploaded";
    let myUrl2="nopic.jpg";


    if(req.files!=null && req.files.profilePic!=null)
    {
        let fileName2=req.files.profilePic.name;//uploaded files goes in file object 
        let fullPath2=__dirname+"/uploads/"+fileName2;
        await req.files.profilePic.mv(fullPath2);//saving pic in upload folder
        msg2="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath2).then(function(picUrlResult2)
        {
            myUrl2=picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
        })
    }
    else
    {
        myUrl2=req.body.hdnProfile;     
    }
    //===========
    let emailid=req.body.inputEmail;
    let name=req.body.inputName;
    let mobile=req.body.inputMobile;
    let address=req.body.inputAddress;
    let city=req.body.inputCity;

    
    mysqlCon.query("update  dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,picpath=? where emailid=?",[name,mobile,address,city,myUrl,myUrl2,emailid],function(err){
            
        if(err==null)
            resp.sendFile(__dirname+"/public/response.html");
        else
            resp.send(err.message);
    })

 

})
app.get("/fetch-one",function(req,resp){

    let email=req.query.emailidKuch;
      mysqlCon.query("select *  from dprofiles where emailid=?",[email],function(err,resultOne){

        if(err==null)
        {
            resp.send(resultOne);
        }
        else 
            resp.send(err.message);
      })
})
//=============AVIL-MEDICINE===================
app.post("/med-data",async function(req,resp){
    
    
    //File uploading
    let msg="File Not Uploaded";
    let myUrl="nopic.jpg";


    if(req.files!=null)
    {
        let fileName=req.files.medPic.name;//uploaded files goes in file object 
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.medPic.mv(fullPath);//saving pic in upload folder
        msg="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        })
    }
    //===========
    let emailid=req.body.inputEmail;
    let medname=req.body.inputMedName;
    let expdate=req.body.inputDate;
    let company=req.body.inputCompany;
    let packing=req.body.packing
    let qty=req.body.qty;
    let info=req.body.inputInfo;
    

    //=======
    mysqlCon.query("insert into medicines values(?,?,?,?,?,?,?,?,?)",[null,emailid,medname,expdate,company,packing,qty,info,myUrl],function(err){
            
        if(err==null)
            resp.sendFile(__dirname+"/public/response.html");
        else
            resp.send(err.message);
    })

})
//========AVAIL-EQUIP==============
app.post("/equip-data",async function(req,resp){
    
    
    //File uploading
    let msg="File Not Uploaded";
    let myUrl="nopic.jpg";


    if(req.files!=null)
    {
        let fileName=req.files.pic1.name;//uploaded files goes in file object 
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.pic1.mv(fullPath);//saving pic in upload folder
        msg="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        })
    }
     //File uploading
    let msg2="File Not Uploaded";
    let myUrl2="nopic.jpg";


    if(req.files!=null)
    {
        let fileName2=req.files.pic2.name;//uploaded files goes in file object 
        let fullPath2=__dirname+"/uploads/"+fileName2;
        await req.files.pic2.mv(fullPath2);//saving pic in upload folder
        msg2="uploaded Successfully";   

        await cloudinary.uploader.upload(fullPath2).then(function(picUrlResult)
        {
            myUrl2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
        })
    }
    //===========
    let emailid=req.body.inputEmail;
    let equipment=req.body.inputEquip;
    let condition=req.body.condition;
    let type=req.body.RadioAmount;
    let amount=req.body.inputAmount;
    let info=req.body.inputInfo;
    

    //=======
    mysqlCon.query("insert into equipments values(?,?,?,?,?,?,?,?,?)",[null,emailid,equipment,condition,type,amount,myUrl,myUrl2,info],function(err){
            
        if(err==null)
            resp.sendFile(__dirname+"/public/response.html");
        else
            resp.send(err.message);
    })

})
//===Dashboard=====
app.get("/useradminDash", function(req, resp) {
    var path=__dirname+"/public/admin-users-dash.html";
        resp.sendFile(path);
});
app.get("/donorData", function(req, resp) {
    var path=__dirname+"/public/admin-donors-dash.html";
        resp.sendFile(path);
});
//=================
app.get("/fetch-all",function(req,resp)
{

     mysqlCon.query("select * from userspro ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//====BLOCK====
app.get("/do-block",function(req,resp){

    let email= req.query.emailKeyKuch;

     mysqlCon.query("update userspro set active=? where emailid=?",[0,email],function(err,result) 
     {
        if(err==null)
              {
                if(result.affectedRows==1)
                    resp.send("User Blocked")  ;
                else
                       resp.send("Invalid Email id")  ; 
              }
        else
                resp.send(err.message);
    })
})
app.get("/do-resume",function(req,resp){
    let email= req.query.emailKeyKuch;

     mysqlCon.query("update userspro set active=? where emailid=?",[1,email],function(err,result) 
     {
        if(err==null)
              {
                if(result.affectedRows==1)
                    resp.send("User Un-Blocked")  ;
                else
                       resp.send("Invalid Email id")  ; 
              }
        else
                resp.send(err.message);
    })
})
app.get("/do-delete",function(req,resp){
    let email= req.query.emailKeyKuch;

     mysqlCon.query("delete from userspro where emailid=?",[email],function(err,result) 
     {
        if(err==null)
              {
                if(result.affectedRows==1)
                    resp.send("Record  Deleted Successsfulllyyyy")  ;
                else
                       resp.send("Invalid Email id")  ; 
              }
        else
                resp.send(err.message);
    })
})
//=====Fetch Donor====
app.get("/fetch-donor",function(req,resp)
{

     mysqlCon.query("select * from dprofiles ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//=====
app.get("/donorDash", function(req, resp) {
    var path=__dirname+"/public/dash-donor.html";
        resp.sendFile(path);
});
//FETCH MEDICINES=====
app.get("/fetch-medicine",function(req,resp)
{
        let email=req.query.emailidKuch;

     mysqlCon.query("select * from medicines where emailid=?",[email],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
app.get("/do-deleteMed",function(req,resp){
    let rid= req.query.ridKuch;

     mysqlCon.query("delete from medicines where rid=?",[rid],function(err,result) 
     {
        if(err==null)
              {
                if(result.affectedRows==1)
                    resp.send("Record  Deleted Successsfulllyyyy")  ;
                else
                       resp.send("Invalid Email id")  ; 
              }
        else
                resp.send(err.message);
    })
})
app.get("/update-pass",function(req,resp){
    let email= req.query.emailidKuch;
    let passOLD=req.query.passOld;
    let passNEW=req.query.passNew;

     mysqlCon.query("update userspro set pwd=? where emailid=? AND pwd=?",[passNEW,email,passOLD],function(err,result) 
     {
       if(err==null){
                if(result.affectedRows==1)
                    resp.send("Password Updated Successfully");
                else
                    resp.send("Invalid Email");
            }
            else
                resp.send(err.message);

    })
})
app.get("/adminDash", function(req, resp) {
    var path=__dirname+"/public/dash-admin.html";
        resp.sendFile(path);
});
app.get("/allMedicine", function(req, resp) {
    var path=__dirname+"/public/all-medicines.html";
        resp.sendFile(path);
});
//=========Fetch Medicine in cards
app.get("/fetch-Allmedicine",function(req,resp)
{
     mysqlCon.query("select * from medicines ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
app.get("/fetch-medDetail",function(req,resp)
{
    let rid=req.query.ridKuch
     mysqlCon.query("select * from medicines where rid=? ",[rid],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//==EQP manager
app.get("/fetch-equipment",function(req,resp)
{
        let email=req.query.emailidKuch;
     mysqlCon.query("select * from equipments where emailid=?",[email],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})

app.get("/do-deleteEqp",function(req,resp){
    let rid= req.query.ridKuch;

     mysqlCon.query("delete from equipments where rid=?",[rid],function(err,result) 
     {
        if(err==null)
              {
                if(result.affectedRows==1)
                    resp.send("Record  Deleted Successsfulllyyyy")  ;
                else
                       resp.send("Invalid Email id")  ; 
              }
        else
                resp.send(err.message);
    })
})
//==FINDER MED=====
app.get("/medFInder", function(req, resp) {
    var path=__dirname+"/public/medFinder.html";
        resp.sendFile(path);
});
//=FETCH cities===
app.get("/fetch-cities",function(req,resp)
{

     mysqlCon.query("select distinct city from dprofiles ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
app.get("/fetch-medicines",function(req,resp)
{

     mysqlCon.query("select distinct medname from medicines ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//==Fetch MEd By City
app.get("/show-MedByCity",function(req,resp)
{

    let city=req.query.city;

     mysqlCon.query("select distinct m.medname from dprofiles p INNER JOIN medicines m ON p.emailid = m.emailid where p.city=?",[city],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
app.get("/show-selMed",function(req,resp)
{
      
    let med=req.query.medicine;
    let city=req.query.city;

     mysqlCon.query("SELECT * FROM dprofiles p INNER JOIN medicines m ON p.emailid = m.emailid WHERE p.city=? AND m.medname=?", [city,med],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//===Fetch donor for modal
app.get("/show-donor",function(req,resp)
{

    let email=req.query.email;


     mysqlCon.query("select * from dprofiles where emailid=? ",[email],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//link ngo
app.get("/ngoReg", function(req, resp) {
    var path=__dirname+"/public/ngo-registration.HTML";
        resp.sendFile(path);
});
//====REGD+NGO====
 app.post("/ngo-data",async function(req,resp){
    
    
        //File uploading
        let msg="File Not Uploaded";
        let myUrl="nopic.jpg";
    
    
        if(req.files!=null)
        {
            let fileName=req.files.regproof.name;//uploaded files goes in file object 
            let fullPath=__dirname+"/uploads/"+fileName;
            await req.files.regproof.mv(fullPath);//saving pic in upload folder
            msg="uploaded Successfully";   
    
            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
            {
                myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
                console.log("************")
                console.log(myUrl);
            })
        }
        
        let emailid=req.body.inputEmail;
        let ngo=req.body.inputNgoName;
        let regoffice=req.body.inputRegOff;
        let city=req.body.inputCity;
        let website=req.body.inputWebsite
        let contactno=req.body.inputContact;
        let since=req.body.inputSince;
        let chairperson=req.body.inputChair;
        let ngoworks=req.body.inputWork;
        let regnumber=req.body.inputRegNo;
        
        
    
    
        mysqlCon.query("insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)",[emailid,ngo,regoffice,city,website,contactno,since,chairperson,ngoworks,regnumber,myUrl],function(err){
                
            if(err==null){
                resp.sendFile(__dirname+"/public/response.html");
            }
            else
                resp.send(err.message);
        })
    
    })

//=====EQUIPMENT FINDER======
app.get("/eqpFinder", function(req, resp) {
    var path=__dirname+"/public/equip-finder.html";
        resp.sendFile(path);
});
//=FETCH cities===
app.get("/show-cities",function(req,resp)
{

     mysqlCon.query("select distinct city from dprofiles ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//Fetch eqp by city
app.get("/show-EqpByCity",function(req,resp)
{

    let city=req.query.city;

     mysqlCon.query("select distinct e.equipment from dprofiles p INNER JOIN equipments e ON p.emailid = e.emailid where p.city=?",[city],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//show selected eqp
app.get("/show-selEqp",function(req,resp)
{
      
    let med=req.query.equipment;
    let city=req.query.city;

     mysqlCon.query("SELECT * FROM dprofiles p INNER JOIN equipments e ON p.emailid = e.emailid WHERE p.city=? AND e.equipment=?", [city,med],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//fetch donor
app.get("/fetch-donorEqp",function(req,resp)
{

    let email=req.query.email;


     mysqlCon.query("select * from dprofiles where emailid=? ",[email],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
}) 
//====Search NGO's
app.get("/ngoFinder", function(req, resp) {
    var path=__dirname+"/public/ngo-finder.html";
        resp.sendFile(path);
});
app.get("/fetch-cities",function(req,resp)
{

     mysqlCon.query("select distinct city from dprofiles ",function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
app.get("/show-ngo",function(req,resp)
{

    let city=req.query.city;
     mysqlCon.query("select * from ngos where city=? ",[city],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(resultJSONAry)
                
              }
        else
                resp.send(err.message);
    })
})
//=LINK NEEDY==
app.get("/needyProfile", function(req, resp) {
    var path=__dirname+"/public/needy-profile.html";
        resp.sendFile(path);
});
//=====GEN_AI======

async function GetInfo(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card,give date in YYYY-MM-DD fromat and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: '',address: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData
}
app.post("/needy-data",async function(req,resp)
{
    let jsonResultFromAi;
     let msg="File not Uploaded";
    let myUrl="nopic.jpg";
    if(req.files!=null)
    {
        let fileName=req.files.adharfront.name;
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.adharfront.mv(fullPath);
        msg="Uploaded Successfully";

       await cloudinary.uploader.upload(fullPath).then(async function(picUrlResult)
        {
            myUrl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
             jsonResultFromAi=await GetInfo(myUrl);
             console.log(jsonResultFromAi);
            //resp.send(jsonResultFromAi);

      });

    }
    
    let jsonResultFromAi2;
     let msg2="File not Uploaded";
    let myUrl2="nopic.jpg";
    if(req.files!=null)
    {
        let fileName=req.files.adharrear.name;
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.adharrear.mv(fullPath);
        msg2="Uploaded Successfully";

       await cloudinary.uploader.upload(fullPath).then(async function(picUrlResult)
        {
            myUrl2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
             jsonResultFromAi2=await GetInfo(myUrl2);
             console.log(jsonResultFromAi2);
            //resp.send(jsonResultFromAi);

      });

    }
    
 
    let email=req.body.inputEmail;
    let mobile=req.body.inputMobile;   
    let name=jsonResultFromAi.name;
    let acardno=jsonResultFromAi.adhaar_number;
    let address=jsonResultFromAi2.address;
    let gender=jsonResultFromAi.gender;
    let dob=jsonResultFromAi.dob || NULL;
    //write query to save record

     mysqlCon.query("insert into needys values(?,?,?,?,?,?,?,?,?)",[email,mobile,myUrl,myUrl2,name,acardno,address,gender,dob],function(err){
                
            if(err==null){
                resp.sendFile(__dirname+"/public/response.html");
            }
            else
                resp.send(err.message);
        })
    

})
//==LINK NGO DASH======
app.get("/ngoDash", function(req, resp) {
    var path=__dirname+"/public/dash-ngo.html";
        resp.sendFile(path);
});
//===LINK NEEDY's DASH=====
app.get("/needyDash", function(req, resp) {
    var path=__dirname+"/public/dash-needy.html";
        resp.sendFile(path);
});