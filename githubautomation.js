let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();
let child_process = require("child_process");
let path = require("path");

async function login(){
let data =  await fs.promises.readFile("./details.json");
let {username , password,url} = JSON.parse(data);
await driver.get(url);
let inputnamewillbefound =  driver.findElement(swd.By.css("#login_field"));
let passwordwillbefound =   driver.findElement(swd.By.css("#password"));
let inputs = await Promise.all([inputnamewillbefound,passwordwillbefound]);
await inputs[0].sendKeys(username);
await inputs[1].sendKeys(password);
let loginbtn = await driver.findElement(swd.By.css("input[type=submit]"));
await loginbtn.click();
}
async function createnewrepo(){
let ddbtn = await driver.wait(swd.until.elementLocated(swd.By.className("Header-item position-relative mr-0 d-none d-lg-flex")),10000);
await ddbtn.click();
let dditems = await driver.findElements(swd.By.css("a[class=dropdown-item]"));
let namespromise = [];
for(let i =0; i<dditems.length; i++){
    let namewillbefoundpromise = dditems[i].getText();
    namespromise.push(namewillbefoundpromise);
}
let names = await Promise.all(namespromise);
for(let i=0; i<names.length; i++){
    if(names[i].includes("Your repositories")){
        dditems[i].click();
        break;
    }
}
let newrepobtn = await driver.wait(swd.until.elementLocated(swd.By.className("text-center btn btn-primary ml-3")),10000);
await newrepobtn.click();
let reponame = await driver.findElement(swd.By.id("repository_name"));
await reponame.sendKeys(process.argv[2]);
let description = await driver.findElement(swd.By.id("repository_description"));
await description.sendKeys("This is a repository created by an automated software");
let submitbtn = await driver.findElement(swd.By.className("btn btn-primary first-in-line"));
await submitbtn.click();
}
async function clonerepo(){
    let urlbox = await driver.findElement(swd.By.id("empty-setup-clone-url"));
    let url = await urlbox.getAttribute("value");
    let cmd = "git clone "+url;
    child_process.execSync(cmd);
}

async function pushcode(){
    let srcpath = path.join("./",process.argv[3]);  
    let reponame = process.argv[2];
    let destpath = path.join("./",reponame);
    destpath = path.join(destpath,process.argv[3]);
    fs.copyFileSync(srcpath,destpath);
    let cmd = "cd " + reponame+" && ";
    cmd += "git status && ";
    cmd+= "git add . && ";
    cmd+= "git commit -m\"Uploaded by automation\" && ";
    cmd += "git push"
    child_process.execSync(cmd);
    await driver.navigate().refresh();

}



(async function(){
try{await login();
await createnewrepo();
await clonerepo();
await pushcode();
}catch(err){
    console.log(err+"");
}
}());