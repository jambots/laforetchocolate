var fs;
// ***********************
//First step check parameters mismatch and checking network connection if available call download function
function savefile(URL, Folder_Name, File_Name) {
  //dbuga("savefile("+URL+", "+Folder_Name+", "+File_Name+")");
  if (URL == null && Folder_Name == null && File_Name == null) {
    return;
    }
  else {
    //checking Internet connection availablity
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE) {
      return;
      }
    else{
      download(URL, Folder_Name, File_Name); //If available download function call
      }
    }
  }
var dlURL="";
var dlFolder_Name="";
var dlFile_Name="";
function download(URL, Folder_Name, File_Name) {
  dlURL=URL;
  dlFolder_Name = Folder_Name;
  dlFile_Name= File_Name;
  //step to request a file system 
  //dbuga('download');
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
  }
var debugFS={};
function fileSystemSuccess(fileSystem) {
  debugFS=fileSystem;
  //dbuga("fileSystemSuccess() 0");
  var download_link = encodeURI(dlURL);
  ext = download_link.substr(download_link.lastIndexOf('.') + 1); //Get extension of URL
  //dbuga("fileSystemSuccess() 1");
  
  var directoryEntry = fileSystem.root; // to get root path of directory
    
  directoryEntry.getDirectory(dlFolder_Name, { create: true, exclusive: false }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
  var rootdir = fileSystem.root;
  var fp = rootdir.fullPath; // Returns Full path of local directory
  //dbuga("fileSystemSuccess() 2");

  fp = fp + "/" + dlFolder_Name + "/" + dlFile_Name + "." + ext; // fullpath and name of the file which we want to give
  // download function call
  //dbuga("fss 3 fp="+fp);
  filetransfer(download_link, fp);
  //dbuga("fileSystemSuccess() 4");
  }

function onDirectorySuccess(parent) {
  //dbuga("onDirectorySuccess");
  // Directory created successfuly
  }

function onDirectoryFail(error) {
  //Error while creating directory
  alert("Unable to create new directory: " + error.code);
  }

function fileSystemFail(evt) {
  //Unable to access file system
  alert(evt.target.error.code);
  }
function filetransfer(download_link, fp) {
  fp=fp.replace("//", "file:///storage/sdcard0/");
  //dbuga("filetransfer fp "+fp);
  var fileTransfer = new FileTransfer();
  // File download function with URL and local path
  fileTransfer.download(download_link, fp,
    function (entry) {
      alert("download complete: " + entry.fullPath);
      },
    function (error) {
      //Download abort errors or download failed errors
      alert("download error source " + error.source);
      alert("download error target " + error.target);
      alert("upload error code" + error.code);
      }
    );
  }

