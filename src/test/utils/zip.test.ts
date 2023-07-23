import {zipFolder} from "../../utils/zip";
import * as path from "path";
import * as fs from "fs";
import {expect} from "chai";
import * as fflate from "fflate";

describe("Function config validations", () => {
  beforeEach(() => {

  });

  it("should make zip",() => {
    const functionFolderPath = path.join(__dirname, "..", "assets");
    const destinationPath = path.join(__dirname, "assets.zip");

    zipFolder(functionFolderPath, destinationPath);

    expect(fs.existsSync(destinationPath)).to.be.true;

    const buf:Buffer = fs.readFileSync(destinationPath);
    //const zipFileData = fflate.unzipSync(buf);
    //expect(zipFileData).to.be.an("object");
  });
});