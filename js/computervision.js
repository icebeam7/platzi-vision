const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

const key = '';
const endpoint = 'https://platzicognitive.cognitiveservices.azure.com/';


const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

const createReadStream = require('fs').createReadStream

let options = {
    visualFeatures: ["Categories", "Description", "Tags", "Color", "Faces", "Brands"]
  };

let imageAnalysis = async function analyzeImage(filePath) {
  const description = (await computerVisionClient.describeImageInStream(
    () => createReadStream(filePath), options));
  console.log(description);

  let result = {};
 
  let topCaption = description.captions[0];
  result.text = topCaption.text;
  result.confidence = topCaption.confidence;

  result.tags = description.tags.join();
  result.image = filePath;

  const analysis = (await computerVisionClient.analyzeImageInStream(
    () => createReadStream(filePath), options));

  console.log(analysis);

  result.faces = "";

  analysis.faces.forEach(face => {
    result.faces += face.gender + "(" + face.age + "), ";
  });

  result.brands = "";

  analysis.brands.forEach(brand => {
    result.brands += brand.name + ", ";
  });
  
  return result;
}

module.exports ={
    imageAnalysis
}