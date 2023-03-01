# **Study Dashboard Requirements**

## **Outstanding Questions**

* What other variables should be included?
* What is the form of each clinical variable?
* How will authentication and session management be done (for private views)?
* Is consent status a key variable and, if so, what form will it take?
* If a screen failure occurs, do we want to show that and the reason for it?
* What are the events each participant will go through (e.g. participant status)?
* What date variables will be available (e.g. date of consent, date of upload)? Current expectation is:
    * Onboarding:
        * Patient information: “date of initial mailing”
        * Screening: “date completed”
        * Consent: “date of consent”
        * Attestation: “date of consent attestation”
        * Contact: “datetime of attempt of contact” (multiple)
        * Demographics: “date completed”
    * Exit
    * Clinical (not expected to be required for dashboard)
    * See Data Dictionary (linked in Related Resources below) for up to date details.
* Should there be variables for participant status (consisting of e.g. consent status, screen status, participation status, exit status)?
* Should there be variables for site status (consisting of e.g. not recruiting, recruiting, and complete statuses)?

**Note:** that some of the above questions have been drawn from comments. 

## **Related Resources**

* [Fairhub.io overview](https://docs.google.com/document/d/1q93FIk1Q_LEurr-tmNKj74puRAdAMnOzAg48Ox81IS4/edit)
* [Fairhub.io API](https://github.com/AI-READI/api.fairhub.io) 
* [Fairhub.io Development Stack](https://github.com/AI-READI/dev.fairhub.io/blob/6b90a11e30e3feaa7c8c308a4214e9bd2cc487e6/docs/fairhub/techstack.md)
* [AI-READI GitHub](https://github.com/AI-READI)
* [AI-READI Software Development Best Practices](https://github.com/AI-READI/software-development-best-practices)
* [Variable List](https://docs.google.com/spreadsheets/d/1mGUzsnB0lIMVLGHPphf9uhNhMLbSR0Uk/edit#gid=1042135600)
* [Data Dictionary](https://docs.google.com/spreadsheets/d/1mpYHXPpkNHHVIY5JSR8oa4XakTfNha9U/edit#gid=329802485)
* [Lab assays and reference ranges](https://docs.google.com/document/d/1CB2y1uJ2DHF1Pka5vrSSxQv3yptsKoXrzghlqelyV9k/edit)


## **Functional Requirements**

### **Requirements**

* Data loading by request to Fairhub.io API
* Public view
* Private view
    * Session management and user authentication
    * Query to a user table of the Fairhub.io database
    * Private views would be rendered on the basis of the user’s group property (i.e. values for this might be “public”, “nih”, “ai-readi”)
* Interactive visualizations of data with aggregation, grouping, filtering, and variable selection 
    * A real-time study overview flowchart with dynamically populated participant numbers and study metrics
    * A set of visualizations breaking down participant demographics
    * A set of visualizations illustrating variables over time (e.g. stack bar chart of recruitment over time)
    * A set of visualizations breaking down study status 
* API endpoint on Fairhub.io
* Generate PDF report functionality or copy functionality (copies screenshots for the “copied” data visualization)
* Dashboard configuration via JSON object and configurable links to REDCap API.
    * Key optional feature for future studies leveraging fairhub.io
    * Could be part of the study setup procedure (e.g. “Do you want a study dashboard [y/n], if yes, information is added through a form to define the JSON object that configures the dashboard. 

### **Stack**

* See development stack linked above

### **Notes**

* API request from Fairhub.io will likely require the development of a specific API endpoint to return the needed data from Redcap
* Dashboard will live on Fairhub.io – see documentation related to design elements, web component implementation, and browser support

## **Data Dictionary**

<table>
  <tr>
   <td><strong>Variable</strong>
   </td>
   <td><strong>Type</strong>
   </td>
   <td><strong>Class</strong>
   </td>
   <td><strong>Caveat</strong>
   </td>
   <td><strong>Notes</strong>
   </td>
  </tr>
  <tr>
   <td>Date
   </td>
   <td>datetime
   </td>
   <td>continuous
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Gender
   </td>
   <td>string
   </td>
   <td>categorical
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Race
   </td>
   <td>string
   </td>
   <td>categorical
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Ethnicity
   </td>
   <td>string
   </td>
   <td>categorical
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Age
   </td>
   <td>integer
   </td>
   <td>discrete
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Recruitment Site
   </td>
   <td>string
   </td>
   <td>categorical
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Recruitment count
   </td>
   <td>integer
   </td>
   <td>discrete
   </td>
   <td>-
   </td>
   <td>N/A
   </td>
  </tr>
  <tr>
   <td>Type II diabetes severity
   </td>
   <td>string
   </td>
   <td>ordinal
   </td>
   <td>Based on 4 categories ordered by severity; patient category is estimated from self report questionnaires during the screening process. 
   </td>
   <td>See note below table.
   </td>
  </tr>
  <tr>
   <td>Participant status
   </td>
   <td>string
   </td>
   <td>categorical
   </td>
   <td>This variable may be computed on the front-end
   </td>
   <td>An aggregate variable
   </td>
  </tr>
  <tr>
   <td>Screen status
   </td>
   <td>string (?)
   </td>
   <td>categorical (?)
   </td>
   <td>
   </td>
   <td>Child variable of participant status
   </td>
  </tr>
  <tr>
   <td>Consent Status
   </td>
   <td>string (?)
   </td>
   <td>categorical (?)
   </td>
   <td>Will consent status be complex rather than a binary variable (e.g. has consented to x and y but not z)?
   </td>
   <td>Child variable of participant status
   </td>
  </tr>
  <tr>
   <td>Exit status
   </td>
   <td>string (?)
   </td>
   <td>categorical (?)
   </td>
   <td>Not yet identified as a required variable
   </td>
   <td>Child variable of participant status. Indicates how a participant has exited the study (e.g. no consent, screen failure, non-responsive, died)
   </td>
  </tr>
  <tr>
   <td>Site status
   </td>
   <td>string (?)
   </td>
   <td>categorical (?)
   </td>
   <td>Not yet identified as a required variable
   </td>
   <td>Indicates whether a site is recruiting or in the pre- or post- recruitment phase
   </td>
  </tr>
</table>

**Note:** The above data dictionary is considered a minimum set and requires further review from the anticipated Bridge2AI users. 

## **Use Cases**

The dashboard is intended to answer key questions from stakeholders monitoring study progress. For this reason, use cases are defined on the basis of the questions that are expected to be asked of the study data during recruitment. 

### **_“What is the overall status of the study?”_**

#### **Functional requirements**

* Visualize participant counts across the study
* Aggregate recruitment by study variable
* Filter recruitment by participant status

#### **Variables**

* Gender
* Participant status 
* Recruitment count (by site)
* Recruitment site
* Datetime

#### **Notes**

* This visualization will be constructed as a flowchart of the study where each feature relates to an event in the study (not necessarily defined within participant status).
* For each study flow chart feature, participant counts and other variables of interest will be dynamically populated.
* This will represent the top-level visualization that will render such that no scrolling is required to view it.

### **_“What is the overall recruitment count by [variable]?”_**

#### **Functional requirements**

* Visualize recruitment counts over time
* Aggregate recruitment by study variable (e.g. site)
* Filter recruitment by study variable (e.g. site)
* Filter recruitment by participant variable (e.g. gender, race)

#### **Variables**

* Gender
* Type II diabetes severity
* Participant status 
* Race
* Ethnicity
* Age
* Recruitment count (by site)
* Recruitment site
* Datetime

#### **Notes**

* Likely variables to filter recruitment here are site, participant status, gender, race, ethnicity, and type II diabetes severity, and participant status. 
* Age is not a key (i.e. required) variable but may be useful.
* Core visualization is anticipated to be a stacked bar chart with recruitment count on the Y-axis, date on the X-axis, and binning by recruitment site.
* Allowing a comparison of expected/anticipated recruitment to determine progress for goals
* Supplemental visualizations, like area charts, may be useful. 

### **_“What is the demographic breakdown of active study participants?”_**

#### **Functional requirements**

* Visualize demographics of a active study participants
* Aggregate participant exit status by study variable (e.g. study event, gender)
* Filter active study participants by participant variable (e.g. age, gender, race, ethnicity)

#### **Variables**

* Gender
* Race
* Ethnicity
* Age
* Participant status (by site)
* Recruitment site
* Participant status
* Date

#### **Notes**

* If we imagine the study as a marketing funnel, with the conversion as study completion, what we want to know here is two-fold: 1. where are participants exiting the study and 2. what are the exit rates by demographic?
* One way to visualize this could be essentially with a study path where each study event for the participant is represented as a waypoint along the path. Clicking on a waypoint updates a set of donut charts below or to the right that break down both the number of participants exiting at that point of the study and their demographics.

### **_“What issues are challenging recruitment?”_**

#### **Functional requirements**

* Visualize recruitment counts over time
* Aggregate recruitment by study variable (e.g. site)
* Filter recruitment by study variable (e.g. site)
* Filter recruitment by participant variable (e.g. gender, race)
* Filter recruitment by participant status (e.g. consented, at-home data collection, follow-up visit 1)
* Supplementary visualizations (e.g. donut chart of consent status by site)

#### **Variables**

* Gender
* Type II diabetes severity
* Race
* Ethnicity
* Age
* Recruitment count (by site)
* Recruitment site
* Consent status (or other?)
* Date

#### **Notes**

* The key variable related to recruitment status may be one akin to “consent status” or “participant status” more generally, but there may be an issue recording information (even if it’s not PHI) for prospective participants who do not consent and thus are not in the study. Prospective participants are expected to have consented for their medical data to be used in research, but the consent status variable relates to the study specific consent. 
* Consent may be more complex than a simple binary variable; for example, it could be specific to certain parts of the study and not others. It may help to discuss whether this will be the case with the PIs managing the study recruitment for each site.
* Other variables, such as prospective participants who are non-responsive may be available and of interest. This may be important for investigating any challenges in recruitment but, again, more information from the Bridge2AI user base may be needed. 

### **_“Where and why are participants exiting the study?”_**

#### **Functional requirements**

* Visualize participant exit status
* Aggregate participant status by study variable (e.g. study event, gender)
* Filter participant status by study variable (e.g. study event, gender)

#### **Variables**

* Gender
* Race
* Ethnicity
* Age
* Participant status (by site)
* Screen status (by site)
* Consent status (by site)
* Recruitment site
* Date

#### **Notes**

* If we imagine the study as a marketing funnel, with the conversion as study completion, what we want to know here is two-fold: 1. where are participants exiting the study and 2. what are the exit rates by demographic?
* One way to visualize this could be essentially with a study path where each study event for the participant is represented as a waypoint along the path. Clicking on a waypoint populates a set of donut charts below or to the right that break down both the number of participants exiting at that point of the study and their demographics.

### **_“What is the site specific device completion of participants?”_**
