#!/usr/bin/env node

const pbjs = require("protobufjs/cli/pbjs"); // or require("protobufjs/cli").pbjs / .pbts
const fs = require("fs");

const wellknownTypes = {
  string: "string",
  int32: "number",
  float: "number",
  bool: "boolean",
  "google.protobuf.Timestamp": "date"
};

function camelCaseToWords(str) {
  return str
    .match(/^[a-z]+|[A-Z][a-z]*/g)
    .map(function(x) {
      return x[0].toUpperCase() + x.substr(1).toLowerCase();
    })
    .join(" ");
}

function getOtsimoFormType(item) {
  let type = wellknownTypes[item.type];
  if (type) {
    if (item.keyType) {
      type = "stringMap";
    }
    return type;
  }
  // console.log("i am here!", item);
  return undefined;
}
function getValidatorParams(object, key, it) {
  if (object.options && object.options["(otsimo_form.validator)." + key]) {
    if (!it.validator) {
      it.validator = {};
    }
    it.validator[key] = object.options["(otsimo_form.validator)." + key];
  }
  return it;
}
function generateForm(fields) {
  const array = [];
  //console.log(fields);
  Object.keys(fields).map(f => {
    const type = getOtsimoFormType(fields[f]);
    if (type) {
      let it = {
        key: f,
        title: camelCaseToWords(f),
        type
      };
      if (fields[f].rule === "repeated") {
        it.isArray = true;
      }
      if (fields[f].options && fields[f].options["(otsimo_form.format)"]) {
        it.format = fields[f].options["(otsimo_form.format)"];
      }
      if (fields[f].options && fields[f].options["(otsimo_form.readonly)"]) {
        it.readonly = fields[f].options["(otsimo_form.readonly)"];
      }
      if (fields[f].options && fields[f].options["(otsimo_form.sourceKey)"]) {
        it.sourceKey = fields[f].options["(otsimo_form.sourceKey)"];
      }
      if (
        fields[f].options &&
        fields[f].options["(otsimo_form.layoutDirection)"]
      ) {
        it.layoutDirection = fields[f].options["(otsimo_form.layoutDirection)"];
      }
      if (
        fields[f].options &&
        fields[f].options["(otsimo_form.hasDynamicSource)"]
      ) {
        it.hasDynamicSource = true;
        if (it.isArray) {
          it.type = "select";
          it.multiple = true;
          delete it.isArray;
        }
      }
      if (fields[f].comment) {
        it.description = fields[f].comment;
      }

      getValidatorParams(fields[f], "regex", it);
      getValidatorParams(fields[f], "minLength", it);
      getValidatorParams(fields[f], "maxLength", it);
      getValidatorParams(fields[f], "min", it);
      getValidatorParams(fields[f], "max", it);

      array.push(it);
    } else {
      // console.log(classes[fields[f].type]);
      if (classes[fields[f].type].fields) {
        const it = {
          key: f,
          title: camelCaseToWords(f),
          type: "parent",
          isArray: fields[f].rule === "repeated",
          children: generateForm(classes[fields[f].type].fields)
        };
        if (fields[f].comment) {
          it.description = fields[f].comment;
        }
        array.push(it);
      } else if (classes[fields[f].type].values) {
        //Enum
        const it = {
          key: f,
          title: camelCaseToWords(f),
          type: "select",
          multiple: fields[f].rule === "repeated",
          possibleValues: Object.keys(classes[fields[f].type].values).map(
            i => ({ key: i, value: i })
          )
        };
        if (fields[f].comment) {
          it.description = fields[f].comment;
        }
        array.push(it);
      }
    }
  });
  return array;
}

function searchForClasses(object, className) {
  if (object[className]) {
    return object;
  }
  if (object.nested) {
    return searchForClasses(object.nested, className);
  }
  //  console.log(object[Object.keys(object)[0]]);
  return searchForClasses(object[Object.keys(object)[0]], className);
}
function parseOutput(obj) {
  let counter = 0;
  //console.log(obj);
  console.log("Reading proto file...");
  const className = process.argv[3];
  classes = searchForClasses(obj, className);
  if (!classes[className]) {
    console.log("Incorrect interface");
    return;
  }
  const filename = className + "FormSchema.json";
  fs.writeFile(
    filename,
    JSON.stringify(generateForm(classes[className].fields), 3, 3),
    function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file is saved at: " + __dirname + "/" + filename);
    }
  );
  //  console.log(JSON.stringify(generateForm(classes[className].fields), 3, 3));
}
pbjs.main(
  ["--target", __dirname + "/json-target-with-comments.js", process.argv[2]],
  (err, out) => {
    if (err) {
      console.log(err);
    }
    //  console.log(out);
    parseOutput(JSON.parse(out));
  }
);
//./proto/admin.proto
