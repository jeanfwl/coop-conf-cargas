export type ComplementObservation = {
  xTexto: string | number;
  xCampo: string;
};

export type Complements = {
  xObs: string;
  ObsCont: ComplementObservation[];
};
