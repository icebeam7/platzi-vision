const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");
const util = require('util');
const fs = require('fs');

const predictionKey = '';
const projectId = "";
const endPoint = 'https://platzicognitive.cognitiveservices.azure.com/';
const iterationName = "Iteration1";

const predictor_credentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const predictor = new PredictionApi.PredictionAPIClient(predictor_credentials, endPoint);

const createReadStream = require('fs').createReadStream

let imageAnalysis = async function analyzeImage(filePath) {
  const analysis = await predictor.classifyImage(projectId, iterationName, () => createReadStream(filePath));
  console.log(analysis);

  let result = {};
 
  let topPrediction = analysis.predictions[0];
  result.text = topPrediction.tagName;
  result.confidence = topPrediction.probability;

  result.image = filePath;

  return result;
}

module.exports ={
    imageAnalysis
}
