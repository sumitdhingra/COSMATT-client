// Represents QuestionResponse object as obtained from DLS
export interface QuestionResponse {
  type: string;
  id: string;
  interactions: any[];
  data: { submitted: boolean };
}
