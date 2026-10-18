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
  Rule: When the harness runs the Live journey, it shall have the stub student, who shares presence, open a lab of the fixture course, open Tutors Live as the stub lecturer while the student opens the lab again, and compare Live's Courses and Students tabs on both sides.

    Scenario: A student who shares presence appears in Tutors Live (exercises Rules 0330, 0335; presence-tracking.feature, student-engagement.feature)
      Given the persistence stub relays Realtime broadcasts
      And the student signs in from the course
      When the student opens the topic "Topic 1"
      And the student opens the lab "Lab 1"
      Then the lab step "Lab 1" is shown
      When the lecturer opens Tutors Live
      # Live reads the stored activity as it opens (main); up to 17.0.0 it only hears the broadcast the reader sends as
      # a page is opened, so the student opens Lab 1 again while Live listens.
      And the student reloads the page
      Then the lab step "Lab 1" is shown
      When the lecturer looks at their own browser
      Then the page shows the tab "Courses (1)"
      And the page is captured as "courses"
      When the lecturer presses the tab "Students (1)"
      Then the page shows the link "Harness Student"
      And the page is captured as "students"

  @rule-0590 @ears-event-driven @journey-time-calendar @role-lecturer
  Rule: When the harness runs the time calendar journey, it shall seed two students' calendar days for the Rule journeys' course, open the time app's medians and its calendar by week and by day as the stub lecturer, and compare the tables on both sides.

    Scenario: The time app's calendar views compute the same totals and medians from the same days (exercises Rule 0319; analytics-calendar.feature)
      Given the persistence stub holds the seed "time-course"
      When the lecturer opens the time app at "medians"
      And the lecturer types "4321" in the textbox "PIN code"
      And the lecturer presses the button "Verify"
      Then the page shows no dialog "Enter PIN"
      And the page shows the heading "Medians"
      And the page shows the row "Median 130 78 104"
      And the page is captured as "medians"
      When the lecturer opens the time app at "calendar/byweek"
      Then the page shows the heading "Calendar by week"
      And the page shows the row starting "Harness Enrolled Student"
      And the page is captured as "calendar-byweek"
      When the lecturer opens the time app at "calendar/byday"
      Then the page shows the heading "Calendar by day"
      And the page shows the row starting "Harness Student"
      And the page is captured as "calendar-byday"

  @rule-0591 @ears-event-driven @journey-time-labs @role-lecturer
  Rule: When the harness runs the time labs journey, it shall seed three students' lab records for the Rule journeys' course, open the time app's labs by lab and by step, its learning records and the least engaged student's page as the stub lecturer, and compare them on both sides.

    Scenario: The time app's lab views rank the same students the same way (exercises Rule 0319; analytics-lab.feature, lab-analytics.feature)
      Given the persistence stub holds the seed "time-course"
      When the lecturer opens the time app at "lab/bylab"
      And the lecturer types "4321" in the textbox "PIN code"
      And the lecturer presses the button "Verify"
      Then the page shows no dialog "Enter PIN"
      And the page shows the heading "Labs by lab"
      And the page shows the row starting "Harness Enrolled Student"
      And the page shows the row starting "Harness Quiet Student"
      And the page is captured as "lab-bylab"
      When the lecturer opens the time app at "lab/bystep"
      Then the page shows the heading "Labs by step"
      And the page shows the row starting "Harness Student"
      And the page is captured as "lab-bystep"
      When the lecturer opens the time app at "lab/learning-records"
      Then the page shows the heading "Learning records"
      And the page shows the row starting "harness-quiet"
      And the page is captured as "learning-records"
      When the lecturer opens the time app at "harness-quiet"
      Then the page shows the heading "Harness Quiet Student"
      # The student page draws its heat maps after load, and their day grids lay out differently from one load to the
      # next on the same build, so the capture starts at the student's tables.
      When the page scrolls to the heading "Calendar activity by week"
      Then the page is captured as "student"
