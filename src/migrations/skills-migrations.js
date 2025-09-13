/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'DB_Tupin';
const collection = 'Skills';

// The current database to use.
use(database);

// Create a new collection.
db.createCollection(collection);

db.skills.insertMany([
  {
    label: 'Elektronik',
    skill: [
      { value: 'Perbaikan Kulkas' },
      { value: 'Service Mesin Cuci' },
      { value: 'Service TV / Monitor' },
      { value: 'Instalasi & Perbaikan Listrik Kecil' },
    ],
  },
  {
    label: 'Furnitur',
    skill: [
      { value: 'Pertukangan Kayu' },
      { value: 'Reparasi Kursi / Meja' },
      { value: 'Reparasi Lemari & Laci' },
      { value: 'Finishing & Poles Kayu' },
    ],
  },
  {
    label: 'Kamar Mandi',
    skill: [
      { value: 'Perbaikan Keran & Shower' },
      { value: 'Instalasi Pipa' },
      { value: 'Pembersihan Saluran Air Mampet' },
      { value: 'Service Pompa Air' },
    ],
  },
  {
    label: 'Kendaraan',
    skill: [
      { value: 'Service Sepeda' },
      { value: 'Service Motor Ringan' },
      { value: 'Ganti Oli / Rantai' },
      { value: 'Perbaikan Rem' },
    ],
  },
  {
    label: 'lainnya',
    skill: [
      {value: 'lainnya'}
    ]
  },
]);

// The prototype form to create a collection:
/* db.createCollection( <name>,
  {
    capped: <boolean>,
    autoIndexId: <boolean>,
    size: <number>,
    max: <number>,
    storageEngine: <document>,
    validator: <document>,
    validationLevel: <string>,
    validationAction: <string>,
    indexOptionDefaults: <document>,
    viewOn: <string>,
    pipeline: <pipeline>,
    collation: <document>,
    writeConcern: <document>,
    timeseries: { // Added in MongoDB 5.0
      timeField: <string>, // required for time series collections
      metaField: <string>,
      granularity: <string>,
      bucketMaxSpanSeconds: <number>, // Added in MongoDB 6.3
      bucketRoundingSeconds: <number>, // Added in MongoDB 6.3
    },
    expireAfterSeconds: <number>,
    clusteredIndex: <document>, // Added in MongoDB 5.3
  }
)*/

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
