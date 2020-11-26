import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';
import 'bugsnag-js';

@Injectable()
export class PretestService {
  preTestResponses: any;
  assessmentContent: any;
  private pretestQuestionsUrl = environment.API_URL + 'pretest/pretestQuestions';

  constructor(public http: Http) { }

  setPreTestResponses(response) {
    this.preTestResponses = response;
  }

  getPreTestResponses() {
    if (!this.preTestResponses) {
      return [
        {
          "quesText": "How many Watts in 3.3 kW ?",
          "options": [
            {
              "text": "I don’t know.",
              "feedback": "That’s ok. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            },
            {
              "text": "330",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            },
            {
              "text": "3,300",
              "feedback": "That’s correct. Now go to Question 2."
            },
            {
              "text": "3,300,000",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            }
          ],
          "correctAns": "3",
          "isAnsweredCorrectly": true,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "What is the SI unit of speed?",
          "options": [
            {
              "text": "I don’t know.",
              "feedback": "That’s ok. We are trying to create a custom course for you so it is good to for us to know what you know. Try Question 3"
            },
            {
              "text": "mm-Sec^-1",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3"
            },
            {
              "text": "M-Sec^0-1",
              "feedback": "That’s correct. Now go to Question 3."
            },
            {
              "text": "Km-Hr^-1",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3"
            },
            {
              "text": "Furlongs/Fortnight",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3"
            }
          ],
          "correctAns": "3",
          "isAnsweredCorrectly": true,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "What is the SI Unit of Inertia?",
          "options": [
            {
              "text": "I don’t know",
              "feedback": "That’s ok. We are trying to create a custom course for you so it is good to for us to know what you know."
            },
            {
              "text": "gm-cm^2",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "Kg/cm^2",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "Kg-M^2",
              "feedback": "That’s correct. You have completed all the questions on this section. Now proceed to next section."
            }
          ],
          "correctAns": "4"
        },
        {
          "quesText": "I want to move a turntable through three revolutions – how many radians is that?",
          "options": [
            {
              "text": "π",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know. Try question 2."
            },
            {
              "text": "2*π",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know. Try question 2."
            },
            {
              "text": "6* π",
              "feedback": "That’s the correct option. Now go to Question 5."
            },
            {
              "text": "12* π",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know. Try question 2."
            }
          ],
          "correctAns": "3",
          "isAnsweredCorrectly": true,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "I am using a conveyer belt to move a load. The diameter of the drive pulley is 100mm. How many radians will I need to turn the pulley through in order to move my load through 1 Metre.",
          "options": [
            {
              "text": "6* π",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "10",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "20",
              "feedback": "That’s the correct option. You have completed both the questions on this section. Now proceed to next section."
            },
            {
              "text": "10* π",
              "feedback": "That’s an incorrect answer. We are trying to create a custom course for you, so it is good for us to know what you know."
            }
          ],
          "correctAns": "3",
          "isAnsweredCorrectly": true,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "If an object weighs one tonne on the earth, what is its mass on the Moon, roughly?",
          "options": [
            {
              "text": "1 Tonne",
              "feedback": "That’s the correct answer. Now go to Question 2."
            },
            {
              "text": "6 Tonnes",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            },
            {
              "text": "1/6th of a Tonne",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            },
            {
              "text": "Zero",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            },
            {
              "text": "I don’t know.",
              "feedback": "That’s ok. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 2."
            }
          ],
          "correctAns": "1",
          "isAnsweredCorrectly": false,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "What does it weigh in the International Space-station?",
          "options": [
            {
              "text": "1 Tonne",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3."
            },
            {
              "text": "6 Tonnes",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3."
            },
            {
              "text": "1/6th of a Tonne",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know. Try Question 3."
            },
            {
              "text": "Zero",
              "feedback": "That’s the correct answer. Now go to Question 3."
            }
          ],
          "correctAns": "4",
          "isAnsweredCorrectly": false,
          "quesState": "attempted",
          "response": "3"
        },
        {
          "quesText": "What is its mass there?",
          "options": [
            {
              "text": "1 Tonne",
              "feedback": "That’s the correct answer. You have completed all the questions on this section. Now proceed to next section."
            },
            {
              "text": "6 Tonnes",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "1/6th of a Tonne",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "Zero",
              "feedback": "That’s incorrect. We are trying to create a custom course for you, so it is good for us to know what you know."
            }
          ],
          "correctAns": "1"
        },
        {
          "quesText": "A rotating disk has an inertia of 1 Kg-m2. What would the inertia be in the International Space-station?",
          "options": [
            {
              "text": "1 Kg-m2",
              "feedback": "That’s the correct answer. You have completed all the questions on this section. Now proceed to next section."
            },
            {
              "text": "6 Kg-m2",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "1/6th of a Kg-m2",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "Zero",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            }
          ],
          "correctAns": "1"
        },
        {
          "quesText": "A motor needs to provide 10 Nm of torque to a conveyer to move it. The drive roller is 200mm Diameter. What force is required at the circumference of the drive roller to move the conveyer?",
          "options": [
            {
              "text": "1 N",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "10 N",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "20 N",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "50 N",
              "feedback": "That’s incorrect answers .We are trying to create a custom course for you, so it is good for us to know what you know."
            },
            {
              "text": "100 N",
              "feedback": "That’s the correct answer. You have completed all the questions on this section. Now proceed to next section."
            }
          ],
          "correctAns": "5"
        }
      ];
    }
    return this.preTestResponses;
  }

  getAssessmentContent() {
    let assessmentPromise = this.http.get(this.pretestQuestionsUrl).toPromise();

    let assessment = new Promise((resolve, reject) => {
      assessmentPromise.then((res) => {
        this.assessmentContent = res.json();
        resolve(this.assessmentContent);
      })
        .catch((error) => {
          console.log('error getting assessment Content', error);
          Bugsnag.notifyException(error);
          reject(error);
        });
    });

    return assessment;
  }

}
