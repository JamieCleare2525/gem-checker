# Gem-Checker { Prototype: Phase 2 }

---

Gem-Checker is a package designed to provide Ruby on Rails developers with information and version alert notifications regarding RubyGems.

All functions provided by this package are only able to be activated while viewing the Gemfile for your Ruby on Rails application.

## Evaluation
This package is part of a developing final year project. It is important to gather evidence and evaluation of my package being used and tested.

With this in mind, can I ask all user of this package to fill out a short survey.

Survey URL:
https://www.surveymonkey.co.uk/r/SNZ88R6

I thank you in advance for your input and I hope that your feedback will help to improve and further develop this project over the coming months.

## Introduction
Developed as a Final Year Project while studying for a degree in Computer Science at the University of Portsmouth, England.

This package hopes to improve the Atom user experience for Ruby of Rails Developers by generating a variety of notifications, alerting developers to the details, version updates and suggested maintenance of RubyGems installed on Ruby on Rails applications.

## Features
### Cursor Functions
#### Gem Details
Generate an Information Notification regarding the details of a specific RubyGem. The RubyGem is selected by the current placement of your cursor on the Gemfile.

###### Display
* Gem Name - Name of the selected RubyGem.
* Gem Description - A detailed description of the selected RubyGem's functionality, retrieved from https://rubygems.org/.
* Current Version - The current version of the selected RubyGem installed on your Ruby on Rails application.
* Latest Version - The latest version of RubyGem retrieved from https://rubygems.org/.

#### Check Gem Maintenance
RubyGems are often badly maintained, which can cause a variety of issues when updating to newer versions of Rails.

To help indicate these issues, this function takes a selected RubyGem and determines whether or not it has released a new version within the "Poorly Maintenance Warning Threshold". The default "Poorly Maintenance Warning Threshold" is 6 months. This threshold can be configured using the package settings.
If the latest version of the selected gem exceeds this threshold, then a Warning Notification is generated alerting the developer to the issue.

###### Display
* Gem Name - Name of the selected RubyGem
* Warning Description - Sentence detailing the date that the latest version was released.

### Gemfile Functions
#### Check All Gemfile Gem Versions
One of the main issues regarding RubyGems is keeping them up to date with the latest version once they have been installed onto your application.

This function reads the entire Gemfile of your Ruby on Rails application and determines whether or not the current version of each Gem is up to date with the latest version. The warning threshold for this function can be changed within the package settings. The default "Out of Date Warning Threshold" is 5 versions behind the current version.

###### Display
Depending on the function's findings, different Notification Alerts are generated:

* Current version is 1 version behind the latest version
  - Information Notification
  - Gem Name - Name of the selected RubyGem.
  - Warning Sentence - Indicates a new version of this gem is available.
  - Current Version - The current version of the selected RubyGem installed on your Ruby on Rails application.
  - Latest Version - The latest version of the RubyGem retrieved from https://rubygems.org/.

* Current version is between 2 and the warning threshold of versions behind the latest version
  - Warning Notification
  - Gem Name - Name of the selected RubyGem.
  - Warning Sentence - Indicates your currently installed version of this gem is out of date.
  - Current Version - The current version of the selected RubyGem installed on your Ruby on Rails application.
  - Latest Version - The latest version of the RubyGem retrieved from https://rubygems.org/.

* Current version is equal to or greater than the warning threshold of versions behind the latest version
  - Warning Notification
  - Gem Name - Name of the selected RubyGem.
  - Warning Sentence - Indicates your currently installed version of this gem is severally out of date.
  - Current Version - The current version of the selected RubyGem installed on your Ruby on Rails application.
  - Latest Version - The latest version of the RubyGem retrieved from https://rubygems.org/.

#### Gemfile Summary Report
Rather than producing a notification for each out of date RubyGem in the applications Gemfile, produce a single warning notification detailing the number of gems that meet each of the following criteria:
* Current version is 1 version behind the latest version
* Current version is between 2 and the warning threshold of versions behind the latest version
* Current version is equal to or greater than the warning threshold of versions behind the latest version

The warning threshold for this function can be changed within the package settings. The default "Out of Date Warning Threshold" is 5 versions behind the current version.

This function will also produce a text file "gem_version_summary.txt" containing the version details of each out of date gem, categorised by the previously mentioned criteria.

###### Display
* Warning Notification
  - Total Number of Gems that are behind the current version
  - Number of Gems where the current version is 1 version behind the latest version.
  - Number of Gems where the current version is between 2 and the warning threshold of versions behind the latest version.
  - Number of Gems where the current version is equal to or greater than the warning threshold of versions behind the latest version.

* "gem_version_summary.txt" File
  - Gem Name - Name of the selected RubyGem.
  - Current Version - The current version of the selected RubyGem installed on your Ruby on Rails application.
  - Latest Version - The latest version of RubyGem retrieved from https://rubygems.org/.
  - Count of Versions Behind Current Version - The count of the number of versions the current version is behind the latest version.

###### Common Display
* Buttons
  - RubyGem Doc - Opens a browser window directly to the RubyGem Documentation of the specified gem on https://rubygems.org/.
  - Repo - Opens a browser window directly to the GitHub repo of the specified on https://github.com/.

![image of gem-checker package](images/gem_checker1.png)
