# SWCDB Parser/Display

This repo has two components:

A parser, for parsing SWCDB into `conversations.json` and `actors.json`, which are used in the display app. It also helps format portrait dumps correctly for use by the display app.

A display tool, using React + Vite to build render graph node views of conversations.

## Setup

In both `display` and `parser`, run `npm install`.

In the `data/` folder, add `SWCDB.json` which should contain the SWC Database object represented as JSON. It can be dumped using a Unity ripper of your choice.

In the `data/portraits/` folder, put a dump of all textures from the resources.assets namespace from UABEANext.

In `parser/`, run `npm run gen_types` to initialize the schema, then run `npm run start` to generate the JSONs and format portraits.

Now, copy the renamed/cleaned `data/portraits/` folder contents to `display/public/portraits/`.

Now the `display/` app can be started. `npm run dev`.

All done!