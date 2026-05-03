CREATE TABLE `citas` (
	`id` text PRIMARY KEY NOT NULL,
	`id_lead` text NOT NULL,
	`id_usuario` text NOT NULL,
	`id_propiedad` text,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`observacion` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
