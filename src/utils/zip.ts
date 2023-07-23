import * as fs from "fs";
import * as fflate from "fflate";
import Logger from "./logger";

export async function zipFolder(folder: fs.PathLike, zipDestinationPath: string): Promise<void> {
  Logger.debug(`Zipping folder ${folder} to ${zipDestinationPath}`);

  return new Promise<void>((resolve, reject) => {
    const a: fflate.Zippable = makeZippable(folder);

    fflate.zip(a, (err, data)=> {
      if(err){
        Logger.error('Trying to zip folder', err);
        reject(new Error(`An error occurred while creating the package file`));
      }

      const zipFileData = data as Uint8Array;

      try{
        fs.writeFile(zipDestinationPath, zipFileData, () => { resolve(); });
      } catch(e:any) {
        Logger.error('Trying to write zip', e);
        reject(Error(`An error occurred while saving the package file`));
      }
    });
  });
}

function makeZippable(pathLike: fs.PathLike): fflate.Zippable {
  const a: any = {};
  fs.readdirSync(pathLike, { withFileTypes: true }).forEach((value: fs.Dirent) => {
    if(value.isFile()) {
      a[value.name] = fs.readFileSync(`${pathLike}/${value.name}`);
    }
    if(value.isDirectory()) {
      a[value.name] = makeZippable(`${pathLike}/${value.name}`);
    }
  });
  return a;
}