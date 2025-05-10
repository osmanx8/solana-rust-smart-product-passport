/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/smart_passport.json`.
 */
export type SmartPassport = {
  "address": "8tdpknetCPXv5Ztk8yoJWceRCgCxp3T6U56TnUGk99t4",
  "metadata": {
    "name": "smartPassport",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Smart Product Passport program on Solana"
  },
  "instructions": [
    {
      "name": "addManufacturer",
      "discriminator": [
        160,
        104,
        90,
        137,
        232,
        74,
        142,
        42
      ],
      "accounts": [
        {
          "name": "manufacturerList",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "manufacturer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createPassport",
      "discriminator": [
        107,
        136,
        98,
        163,
        167,
        217,
        174,
        84
      ],
      "accounts": [
        {
          "name": "passport",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "serialNumber",
          "type": "string"
        },
        {
          "name": "productionDate",
          "type": "string"
        },
        {
          "name": "deviceModel",
          "type": "string"
        },
        {
          "name": "warrantyPeriod",
          "type": "string"
        },
        {
          "name": "countryOfOrigin",
          "type": "string"
        },
        {
          "name": "manufacturerId",
          "type": "string"
        },
        {
          "name": "ipfsCid",
          "type": "string"
        },
        {
          "name": "owner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "manufacturerList",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "manufacturerList",
      "discriminator": [
        251,
        212,
        99,
        111,
        200,
        211,
        96,
        96
      ]
    },
    {
      "name": "passport",
      "discriminator": [
        18,
        61,
        245,
        239,
        6,
        15,
        18,
        34
      ]
    }
  ],
  "types": [
    {
      "name": "manufacturerList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manufacturers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "passport",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serialNumber",
            "type": "string"
          },
          {
            "name": "productionDate",
            "type": "string"
          },
          {
            "name": "deviceModel",
            "type": "string"
          },
          {
            "name": "warrantyPeriod",
            "type": "string"
          },
          {
            "name": "countryOfOrigin",
            "type": "string"
          },
          {
            "name": "manufacturerId",
            "type": "string"
          },
          {
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
