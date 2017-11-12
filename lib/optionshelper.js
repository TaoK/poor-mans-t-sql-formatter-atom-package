
const PCKG_NAME = "poor-mans-t-sql-formatter";

const TYPE_MIN = "obfuscation";
const TYPE_STD = "standard";
const ABBREV_MIN = "min";
const ABBREV_STD = "std";

const OPTION_NAMES = {
  CONFIRM_ON_ERROR: "confirmOnError",
  EXPECTED_GRAMMARS: "expectedGrammars",
  ERROR_OUTPUT_PREFIX: "errorOutputPrefix",
  FORMATTING_TYPE: "formattingType"
};

var optionRef;

//Convert formatting library options into Atom configuration properties
function mapOption(input) {
  var option = {};
  var refEntry = optionRef[input.name];
  switch (refEntry.type) {
    case 'bool':
      option.type = "boolean";
      break;
    case 'enum':
      option.type = "string";
      option.enum = refEntry.options;
      break;
    case 'string':
      option.type = "string";
      break;
    case 'int':
      option.type = "integer";
      break;
    default:
      throw new Error("unknown option type!")
  }

  option.default = input.overrideDefault || refEntry.default;
  option.description = refEntry.description;
  if (input.order) option.order = input.order;

  input.targetObject[input.name] = option;
}

function mapOptionsForType(input) {
  for (var optionName in optionRef)
    if (optionRef[optionName].appliesToFormattingType
      && optionRef[optionName].appliesToFormattingType.indexOf(input.type) >= 0
      && optionName != "coloring"
      && optionName != "randomizeColor"
      )
      mapOption({
        targetObject: input.targetObject,
        name: optionName
      });
}

function getOptionsDefinition(optionRefFromLib) {
  optionRef = optionRefFromLib;

  var convertedConfig = {};
  var nextBaseEntryOrder = 0;

  convertedConfig[OPTION_NAMES.CONFIRM_ON_ERROR] = {
    type: "boolean",
    default: true,
    description: "If errors were encountered when parsing the SQL (and so the formatting is suspect) - should the formatter request confirmation before replacing the selected text with the formatted result?",
    order: nextBaseEntryOrder++
    };

  convertedConfig[OPTION_NAMES.EXPECTED_GRAMMARS] = {
    type: "array",
    default: ['source.sql', 'text.plain.null-grammar'],
    description: "If Grammar for the current Edit Window does not match one of these grammars, then the formatter will request confirmation before formatting. Default expects SQL files or files with no detected/specified grammar. Asterisk (*) to allow any grammar.",
    order: nextBaseEntryOrder++
  };

  mapOption({
    targetObject: convertedConfig,
    name: OPTION_NAMES.ERROR_OUTPUT_PREFIX,
    overrideDefault: "--WARNING! ERRORS ENCOUNTERED DURING SQL PARSING!\n",
    order: nextBaseEntryOrder++
  });

  mapOption({
    targetObject: convertedConfig,
    name: OPTION_NAMES.FORMATTING_TYPE,
    order: nextBaseEntryOrder++
  });

  convertedConfig[ABBREV_STD] = {
    type: "object",
    title: "Standard Formatting Options",
    properties: {},
    order: nextBaseEntryOrder++
    };
  mapOptionsForType({
    type: TYPE_STD,
    targetObject: convertedConfig[ABBREV_STD].properties
  });

  convertedConfig[ABBREV_MIN] = {
    type: "object",
    title: "Minification / Obfuscation Options",
    properties: {},
    order: nextBaseEntryOrder++
    };
  mapOptionsForType({
    type: TYPE_MIN,
    targetObject: convertedConfig[ABBREV_MIN].properties
  });

  return convertedConfig;
}

function retrieveOption(target, name, lookupPrefix) {
  target[name] = atom.config.get(PCKG_NAME + '.' + (lookupPrefix || "") + name);
}

function detectOptions() {
  var newDetectedOptions = {};
  retrieveOption(newDetectedOptions, OPTION_NAMES.CONFIRM_ON_ERROR);
  retrieveOption(newDetectedOptions, OPTION_NAMES.EXPECTED_GRAMMARS);
  retrieveOption(newDetectedOptions, OPTION_NAMES.ERROR_OUTPUT_PREFIX);
  retrieveOption(newDetectedOptions, OPTION_NAMES.FORMATTING_TYPE);

  for (var optionName in optionRef)
    if (optionRef[optionName].appliesToFormattingType
      && optionRef[optionName].appliesToFormattingType.indexOf(TYPE_STD) >= 0
      && optionName != "coloring"
      )
      retrieveOption(newDetectedOptions, optionName, ABBREV_STD + '.');

  for (var optionName in optionRef)
    if (optionRef[optionName].appliesToFormattingType
      && optionRef[optionName].appliesToFormattingType.indexOf(TYPE_MIN) >= 0
      && optionName != "randomizeColor"
      )
      retrieveOption(newDetectedOptions, optionName, ABBREV_MIN + '.');

  return newDetectedOptions;
}

module.exports = {
  OPTION_NAMES: OPTION_NAMES,
  getOptionsDefinition: getOptionsDefinition,
  detectOptions: detectOptions
};
