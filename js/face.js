const msRest = require("@azure/ms-rest-js");
const Face = require("@azure/cognitiveservices-face");
const { uuid } = require('uuidv4');

const key = '';
const endpoint = 'https://platzicognitive.cognitiveservices.azure.com/';

const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const client = new Face.FaceClient(credentials, endpoint);

const image_base_url = "https://csdx.blob.core.windows.net/resources/Face/Images/";
const person_group_id = uuid();

const createReadStream = require('fs').createReadStream

let imageAnalysis = async function analyzeImage(filePath) {
    let detected_faces = await client.face.detectWithStream(() => createReadStream(filePath),
    {
        returnFaceAttributes: ["Accessories","Age","Blur","Emotion","Exposure","FacialHair","Gender","Glasses","Hair","HeadPose","Makeup","Noise","Occlusion","Smile"],
        // We specify detection model 1 because we are retrieving attributes.
        detectionModel: "detection_01"
    });

    let result = {};


    console.log (detected_faces.length + " face(s) detected from image " + filePath + ".");
    console.log("Face attributes for face(s) in " + filePath + ":");

    result.number = detected_faces.length;
    result.image = filePath;
    result.accesories = "";
    result.age = "";
    result.emotions = "";
    result.facialHair = "";
    result.gender = "";
    result.glasses = "";
    result.hairColor = "";

    detected_faces.forEach (async function (face) {
        // Get the bounding box of the face
        console.log("Bounding box:\n  Left: " + face.faceRectangle.left + "\n  Top: " + face.faceRectangle.top + "\n  Width: " + face.faceRectangle.width + "\n  Height: " + face.faceRectangle.height);

        // Get the accessories of the face
        let attributes = face.faceAttributes;
        let accessories = attributes.accessories.join();
        if (0 === accessories.length) {
            console.log ("No accessories detected.");
            result.accesories += "No accessories detected | ";
        }
        else {
            console.log ("Accessories: " + accessories);
            result.accesories += accesories + " | ";
        }

        // Get face other attributes
        console.log("Age: " + attributes.age);
        console.log("Blur: " + attributes.blur.blurLevel);
        result.age += attributes.age + " | ";

        // Get emotion on the face
        let emotions = "";
        let emotion_threshold = 0.5;

        let faceEmotion = attributes.emotion;

        if (faceEmotion.anger > emotion_threshold) { emotions += "anger, "; }
        if (faceEmotion.contempt > emotion_threshold) { emotions += "contempt, "; }
        if (faceEmotion.disgust > emotion_threshold) { emotions +=  "disgust, "; }
        if (faceEmotion.fear > emotion_threshold) { emotions +=  "fear, "; }
        if (faceEmotion.happiness > emotion_threshold) { emotions +=  "happiness, "; }
        if (faceEmotion.neutral > emotion_threshold) { emotions +=  "neutral, "; }
        if (faceEmotion.sadness > emotion_threshold) { emotions +=  "sadness, "; }
        if (faceEmotion.surprise > emotion_threshold) { emotions +=  "surprise, "; }

        if (emotions.length > 0) {
            let em = emotions.slice (0, -2);
            console.log ("Emotions: " + em);
            result.emotions += em + " | ";
        }
        else {
            console.log ("No emotions detected.");
            result.emotions += "No emotions detected | ";
        }
        
        // Get more face attributes
        console.log("Exposure: " + attributes.exposure.exposureLevel);
        if (attributes.facialHair.moustache + attributes.facialHair.beard + attributes.facialHair.sideburns > 0) {
            console.log("FacialHair: Yes");
            result.facialHair += "Yes | ";
        }
        else {
            console.log("FacialHair: No");
            result.facialHair += "No | ";
        }
        console.log("Gender: " + attributes.gender);
        console.log("Glasses: " + attributes.glasses);

        result.gender += attributes.gender + " | ";
        result.glasses += attributes.glasses + " | ";

        // Get hair color
        var color = "";
        if (attributes.hair.hairColor.length === 0) {
            if (attributes.hair.invisible) { color = "Invisible"; } else { color = "Bald"; }
        }
        else {
            color = "Unknown";
            var highest_confidence = 0.0;
            attributes.hair.hairColor.forEach (function (hair_color) {
                if (hair_color.confidence > highest_confidence) {
                    highest_confidence = hair_color.confidence;
                    color = hair_color.color;
                }
            });
        }
        console.log("Hair: " + color);
        result.hairColor += color;

        // Get more attributes
        console.log("Head pose:");
        console.log("  Pitch: " + attributes.headPose.pitch);
        console.log("  Roll: " + attributes.headPose.roll);
        console.log("  Yaw: " + attributes.headPose.yaw);

        console.log("Makeup: " + ((attributes.makeup.eyeMakeup || attributes.makeup.lipMakeup) ? "Yes" : "No"));
        console.log("Noise: " + attributes.noise.noiseLevel);

        console.log("Occlusion:");
        console.log("  Eye occluded: " + (attributes.occlusion.eyeOccluded ? "Yes" : "No"));
        console.log("  Forehead occluded: " + (attributes.occlusion.foreheadOccluded ? "Yes" : "No"));
        console.log("  Mouth occluded: " + (attributes.occlusion.mouthOccluded ? "Yes" : "No"));

        console.log("Smile: " + attributes.smile);
        console.log();
    });

    console.log(result);
    return result;
}

module.exports ={
    imageAnalysis
}