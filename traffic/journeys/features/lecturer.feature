# Rule journeys: a lecturer's side of Tutors as it is on the monorepo's main, driven by the harness on both sides and
# compared like every other journey. A lecturer journey acts as two people on the same side, each in a browser of their
# own: "the student" is the journey's role, "the lecturer" the identity stub's lecturer (since 1.45.0). Ids 0582 to 0599
# are the harness's own, reserved by the project. Steps: traffic/journeys/steps.ts. Guide:
# docs/user-guide/12-rule-journeys.md.
@harness @lecturer
Feature: Lecturer journeys the harness drives on both sides

  @rule-0588 @ears-event-driven @journey-content-lock @role-enrolled @course-rules
  Rule: When the harness runs the content lock journey, it shall lock a topic from Educator Control as the stub lecturer, open the course as the enrolled stub student before and after the lecturer shows locked content to students, and compare the lecturer's course page and the student's on both sides.

    Scenario: A lock hides a topic from the student until the lecturer shows it greyed out (exercises Rules 0052, 0053, 0054)
      Given the lecturer signs in from the course
      When the lecturer presses the button "Open Educator Control"
      Then the page shows the dialog "Educator Control"
      When the lecturer switches on "Lock Topic 2"
      And the lecturer closes every dialog
      Then the page shows the button "Unlock Topic 2"
      And the page is captured as "lecturer-locked"
      When the student signs in from the course
      Then the page shows the heading "Topic 1"
      And the page shows no heading "Topic 2"
      And the page is captured as "student-hidden"
      When the lecturer presses the button "Open Educator Control"
      And the lecturer switches on "Show locked content to students"
      And the lecturer closes every dialog
      And the student reloads the page
      Then the card "Topic 2" shows the text "Locked"
      And the page shows no link starting "Topic 2"
      And the page is captured as "student-locked-card"

  @rule-0589 @ears-event-driven @journey-live
  Rule: When the harness runs the Live journey, it shall have the stub student, who shares presence, open a lab of the fixture course, then open Tutors Live as the stub lecturer, and compare its Courses and Students tabs on both sides.

    Scenario: A student who shares presence appears in Tutors Live (exercises Rules 0330, 0335; presence-tracking.feature, student-engagement.feature)
      Given the student signs in from the course
      When the student opens the topic "Topic 1"
      And the student opens the lab "Lab 1"
      Then the lab step "Lab 1" is shown
      When the lecturer opens Tutors Live
      Then the page shows the tab "Courses (1)"
      And the page is captured as "courses"
      When the lecturer presses the tab "Students (1)"
      Then the page shows the link "Harness Student"
      And the page is captured as "students"
