Dedete
======

Data Driven Tests for Mocha.

Sorry for this not being documented. It will be for the next rewrite.


Note about versions
-------------------

- 1.0.0 was a funtional but primitive version. It was also written with support
  for old Node.js versions without Promise or modern language features.
  It had dependencies for lodash and Q that are not needed in modern JS.
  At least one dependence had vulnerabilities. It also has no documentation.

- 2.0.0 is a revision of 1.0.0 removing the dependences and changing some code
  to more modern JS. Version has changed because it won't work in some node
  versions that previously worked.
  The dependences are gone, but still no documentation.

- 3.x version will be a more complete version, with some additional features,
  such supporting other test generators than a JSON file.

About the name
--------------

Dedete is how DDT (Data Driven Test) is spelled in Spanish, all put together.
It could be also a diminutive word for "Dedo" (finger).