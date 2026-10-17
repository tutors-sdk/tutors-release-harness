# Rule journeys: a student's side of Tutors as it is on the monorepo's main, driven by the harness on both sides and
# compared like every other journey. Each Rule is the harness's own (ids 0582 to 0599, reserved by the project); the
# scenario's name lists the monorepo Rules it exercises. Steps: traffic/journeys/steps.ts. Guide:
# docs/user-guide/12-rule-journeys.md.
@harness @student
Feature: Student journeys the harness drives on both sides

  @rule-0582 @ears-event-driven @journey-signed-in-lab
  Rule: When the harness runs the signed-in lab journey, it shall sign in as the stub student, open the fixture course's lab, move between two of its steps, and compare every page, the persistence ledger and the Realtime cost of both sides.

    Scenario: A signed-in student reads a lab (exercises Rules 0011, 0250, 0252, 0260, 0303, 0330)
      Given the student signs in from the course
      And the page shows the button "Profile menu"
      And the page is captured as "course"
      When the student opens the topic "Topic 1"
      And the student opens the lab "Lab 1"
      Then the lab step "Lab 1" is shown
      And the page is captured as "lab-step"
      When the student moves to the step "Step 1"
      Then the lab step "Step 1" is shown
      And the page is captured as "lab-step-2"
      When the student moves to the step "Lab 1"
      Then the lab step "Lab 1" is shown
      And the page is captured as "lab-step-back"

  @rule-0583 @ears-event-driven @journey-presence
  Rule: When the harness runs the presence journey, it shall sign in as the stub student, pick a course sentiment from the profile menu, open the online list from the course navigation, and compare the menu, the list, the rows written and the Realtime cost of both sides.

    Scenario: A student who shares presence sees themself online (exercises Rules 0046, 0064, 0280)
      Given the student signs in from the course
      When the student presses the button "Profile menu"
      Then the page shows the button "Share Presence · On"
      When the student presses the button starting "Course sentiment"
      Then the page shows the dialog "Course sentiment"
      And the button "neutral" is pressed
      When the student presses the button "confident"
      Then the page shows the button "Course sentiment: confident. Open menu to change."
      And the page is captured as "profile-menu"
      When the student closes every dialog
      And the student presses the button starting "View Online"
      Then the dialog "View Online" shows the link "Harness Student"
      And the page is captured as "online-list"

  @rule-0584 @ears-event-driven @journey-quiz-notebook-talk @role-enrolled @course-rules
  Rule: When the harness runs the quiz, notebook and talk journey, it shall sign in as the enrolled stub student, move forward a slide of a talk, a cell of a notebook, answer and submit a quiz, and compare each page, its state on screen, the rows written and the Realtime cost of both sides.

    Scenario: An enrolled student works through a talk, a notebook and a quiz (exercises Rules 0047, 0049, 0050)
      Given the student signs in from the course
      When the student opens the topic "Topic 1"
      And the student opens the talk "Talk 1"
      Then the page shows the text "1 of 4"
      When the student presses the button "Forward 1 slide"
      Then the page shows the text "2 of 4"
      And the page is captured as "talk-slide-2"
      When the student goes back to the topic "Topic 1"
      And the student opens the notebook "Notebook 1"
      Then the page shows the text "Cell 1 of 2"
      When the student presses the button "Next cell"
      Then the page shows the text "Cell 2 of 2"
      And the page is captured as "notebook-cell-2"
      When the student goes back to the topic "Topic 1"
      And the student opens the quiz "Quiz 1"
      And the student chooses "const" in the group "1. Which keyword declares a constant?"
      And the student presses the button "Next"
      And the student chooses "True" in the group "2. A lab step can hold code."
      And the student presses the button "Previous"
      Then the page shows the radio "const"
      When the student presses the button "Next"
      And the student presses the button "Submit"
      Then the page shows the status "You answered 2 of 2 questions correctly. 100%."
      And the page is captured as "quiz-results"

  @rule-0585 @ears-event-driven @journey-preferences @role-enrolled @course-rules
  Rule: When the harness runs the preferences journey, it shall sign in as the enrolled stub student, choose the dark appearance and a theme, reload the page, and compare the page in its chosen appearance and the Preferences menu after the reload on both sides.

    Scenario: A student's appearance and theme survive a reload (exercises Rules 0037, 0038, 0039)
      Given the student signs in from the course
      When the student presses the button "Preferences"
      Then the page shows the dialog "Preferences"
      And the button "Light" is pressed
      When the student presses the button "Dark"
      And the student selects "Dyslexia" in the combobox "Theme"
      Then the button "Dark" is pressed
      When the student closes every dialog
      And the student reloads the page
      Then the page shows the button "Preferences"
      And the page is captured as "course-dark"
      When the student presses the button "Preferences"
      Then the button "Dark" is pressed
      And the combobox "Theme" shows "Dyslexia"
      And the page is captured as "preferences-after-reload"

  @rule-0586 @ears-unwanted @journey-private-course @course-rules
  Rule: If the stub student signs in to the Rule journeys' private course, which does not list them, then the harness shall see the reader send them to My courses, at sign-in and when they type the course's address, and compare that page on both sides.

    Scenario: A student the course does not list is turned away (exercises Rules 0011, 0267; whitelist-management.feature "Non-whitelisted student denied access")
      Given the student signs in from the course and is turned away
      Then the page shows the region "Welcome to Tutors"
      And the page is captured as "turned-away"
      When the student opens the course by its address and is turned away
      Then the page shows no heading "Harness Rules Course"
      And the page is captured as "turned-away-again"

  @rule-0587 @ears-event-driven @journey-calendar-llm @role-enrolled @course-rules
  Rule: When the harness runs the calendar and LLM journey, it shall sign in as the enrolled stub student, filter the course calendar to assessments, open the course's page for LLMs, and compare the calendar, the LLM page and its links on both sides.

    Scenario: A student filters the calendar and finds the course for LLMs (exercises Rules 0042, 0284)
      Given the student signs in from the course
      When the student presses the button starting "View Calendar"
      Then the page shows the dialog "Harness Rules Course Calendar · 2026"
      And the table "Harness Rules Course Calendar" has 5 rows
      When the student selects "Assessments" in the combobox "Show"
      Then the table "Harness Rules Course Calendar" has 2 rows
      And the page shows the row starting "Sep 21, 2026 3 Week 3 Assignment 1"
      And the page is captured as "calendar-assessments"
      When the student closes every dialog
      And the student presses the link "A version of this course for LLMs"
      Then the page shows the heading "Docs for LLMs"
      And the page shows the link "harness-rules-course-complete-llms.txt"
      And the page is captured as "llm"
