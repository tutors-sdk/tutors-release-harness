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
