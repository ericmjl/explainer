export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "d7246b55d54f7c3816e2a9b0a3c53b2a30f9ae755edc4f934bb82c496f0d081b",
      "architectures/alphafold2.yaml": "bfa529c29a222eb432df9c057be4457336667d72b4e7629dc154d02f3ebc9078",
      "views/alphafold2-semantic-zoom.view.yaml": "da53ee524756bca4007843a9dc30c115a24bc374c185c408099939da27da17b5",
      "pseudocode/alphafold2.yaml": "8501fe6fb3f23cb3e090083dace7e9ffc04aade810a93b41d30491f1b71707c0"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "alphafold2",
    "name": "AlphaFold 2 Monomer Prediction",
    "family": "protein_structure_prediction",
    "status": "draft",
    "taskModes": [
      "monomer_structure_prediction"
    ],
    "referenceConfiguration": {
      "model_preset": "monomer",
      "configured_models": 5,
      "configured_recycles_before_final_pass": 3,
      "method_repository_revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af2_config_code",
            "role": "configuration_evidence",
            "locator": "MODEL_PRESETS, CONFIG_DIFFS, and CONFIG.model.num_recycle"
          },
          {
            "source_ref": "af2_runner_code",
            "role": "implementation_evidence",
            "locator": "main; model_names and model_runners construction"
          },
          {
            "source_ref": "af2_model_code",
            "role": "implementation_evidence",
            "locator": "AlphaFold.__call__",
            "note": "Three configured recycling calls are followed by the final prediction call."
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/alphafold2.yaml",
    "sources": [
      {
        "source_ref": "af2_2021",
        "role": "architecture_description"
      },
      {
        "source_ref": "af2_2021_supplement",
        "role": "detailed_architecture_description"
      },
      {
        "source_ref": "af2_runner_code",
        "role": "inference_orchestration"
      },
      {
        "source_ref": "af2_data_pipeline_code",
        "role": "feature_pipeline_implementation"
      },
      {
        "source_ref": "af2_model_wrapper_code",
        "role": "model_runner_implementation"
      },
      {
        "source_ref": "af2_model_code",
        "role": "monomer_model_implementation"
      },
      {
        "source_ref": "af2_structure_code",
        "role": "structure_module_implementation"
      },
      {
        "source_ref": "af2_config_code",
        "role": "reference_configuration"
      },
      {
        "source_ref": "af2_relax_code",
        "role": "relaxation_implementation"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af2_runner_code",
            "role": "implementation_evidence",
            "locator": "predict_structure",
            "note": "The root accounts for feature generation, configured model predictions, confidence ranking, optional relaxation, and result serialization."
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.feature_pipeline",
            "modules.prediction_ensemble",
            "modules.confidence_ranker",
            "modules.relaxation_stage",
            "modules.artifact_exporter"
          ]
        },
        "modules.feature_pipeline": {
          "status": "partial",
          "reason": "Database search, template processing, MSA clustering, and model-specific feature transforms are deferred to the feature-pipeline drilldown.",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.prediction_ensemble": {
          "status": "partial",
          "reason": "Per-model feature processing, Algorithm 2, recycling state, Evoformer, Structure Module, and prediction heads are reserved for paper-aligned child boards.",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.confidence_ranker": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.relaxation_stage": {
          "status": "partial",
          "reason": "The root accounts for policy selection and its output semantics; OpenMM/Amber minimization internals are intentionally deferred.",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.artifact_exporter": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 6,
        "expandedScopeCount": 1,
        "completeExpandedScopeCount": 1,
        "partialScopeCount": 3,
        "leafFrontierCount": 2,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 3,
        "maximumAuthoredDepth": 1
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [
        "modules.feature_pipeline",
        "modules.prediction_ensemble",
        "modules.relaxation_stage"
      ]
    },
    "modules": [
      {
        "id": "feature_pipeline",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "partial",
          "reason": "Database search, template processing, MSA clustering, and model-specific feature transforms are deferred to the feature-pipeline drilldown."
        },
        "label": "MSA and Template Feature Pipeline",
        "kind": "adapter",
        "mechanisms": [
          "fasta_parsing",
          "genetic_database_search",
          "template_search",
          "raw_feature_assembly"
        ],
        "role": "parse one protein sequence, search sequence and structure databases, and assemble the shared raw model features",
        "scale": "protein",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_data_pipeline_code",
              "role": "implementation_evidence",
              "locator": "DataPipeline.process"
            },
            {
              "source_ref": "af2_runner_code",
              "role": "orchestration_evidence",
              "locator": "predict_structure; data_pipeline.process call"
            }
          ]
        }
      },
      {
        "id": "prediction_ensemble",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "partial",
          "reason": "Per-model feature processing, Algorithm 2, recycling state, Evoformer, Structure Module, and prediction heads are reserved for paper-aligned child boards."
        },
        "label": "Monomer Model Ensemble and Recycling",
        "kind": "controller",
        "mechanisms": [
          "per_model_feature_processing",
          "parameterized_model_execution",
          "representation_ensembling",
          "prediction_recycling"
        ],
        "role": "run every configured monomer parameter set on independently processed features and collect its structure and confidence prediction",
        "scale": "candidate_set",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "orchestration_evidence",
              "locator": "main; model_runners construction and predict_structure model loop"
            },
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "RunModel.process_features and RunModel.predict"
            },
            {
              "source_ref": "af2_model_code",
              "role": "implementation_evidence",
              "locator": "AlphaFold and AlphaFoldIteration"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "architecture_evidence",
              "locator": "Algorithm 2"
            }
          ]
        }
      },
      {
        "id": "confidence_ranker",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Monomer Confidence Ranker",
        "kind": "controller",
        "mechanisms": [
          "mean_plddt_scoring",
          "descending_candidate_sort"
        ],
        "role": "order candidate structures by the monomer ranking confidence derived from mean predicted LDDT",
        "scale": "candidate_set",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "get_confidence_metrics; non-multimer branch"
            },
            {
              "source_ref": "af2_runner_code",
              "role": "orchestration_evidence",
              "locator": "predict_structure; ranking_confidences and ranked_order"
            }
          ]
        }
      },
      {
        "id": "relaxation_stage",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "partial",
          "reason": "The root accounts for policy selection and its output semantics; OpenMM/Amber minimization internals are intentionally deferred."
        },
        "label": "Optional Amber Relaxation",
        "kind": "refiner",
        "mechanisms": [
          "best_all_none_policy",
          "amber_energy_minimization",
          "unrelaxed_pass_through"
        ],
        "role": "relax the configured subset of ranked candidates and preserve unrelaxed coordinates for every unselected candidate",
        "scale": "candidate_set",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "orchestration_evidence",
              "locator": "predict_structure; ModelsToRelax selection and ranked output fallback"
            },
            {
              "source_ref": "af2_relax_code",
              "role": "implementation_evidence",
              "locator": "AmberRelaxation.process"
            }
          ]
        }
      },
      {
        "id": "artifact_exporter",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Prediction Artifact Exporter",
        "kind": "serializer",
        "mechanisms": [
          "structure_serialization",
          "confidence_serialization",
          "run_metadata_serialization"
        ],
        "role": "write ranked structures and the feature, model-result, confidence, ranking, timing, and relaxation records for the prediction run",
        "scale": "run",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; output file writes"
            }
          ]
        }
      }
    ],
    "blockInstances": [

    ],
    "representations": [
      {
        "id": "fasta_sequence",
        "scale": "protein",
        "semantic_role": "single-chain amino-acid sequence submitted for structure prediction",
        "shape": "N_res residues",
        "glyph": "vector",
        "carries": [
          "protein identifier",
          "primary amino-acid sequence"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_data_pipeline_code",
              "role": "implementation_evidence",
              "locator": "DataPipeline.process"
            }
          ]
        }
      },
      {
        "id": "raw_feature_bundle",
        "scale": "protein",
        "semantic_role": "heterogeneous raw feature dictionary shared by the configured monomer model runs",
        "shape": "dictionary of sequence, MSA, template, mask, and metadata arrays",
        "carries": [
          "target sequence features",
          "deduplicated multiple-sequence alignment features",
          "featurized structural template hits",
          "residue and template masks"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_data_pipeline_code",
              "role": "implementation_evidence",
              "locator": "DataPipeline.process"
            }
          ]
        }
      },
      {
        "id": "model_prediction_set",
        "scale": "candidate_set",
        "semantic_role": "per-model predicted structures and confidence outputs before ranking",
        "shape": "N_model candidates with N_res x 37 x 3 atom coordinates and confidence fields",
        "glyph": "coordinates",
        "carries": [
          "predicted all-atom coordinates",
          "per-residue pLDDT",
          "ranking confidence",
          "optional predicted aligned error and predicted TM score"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "RunModel.predict and get_confidence_metrics"
            },
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; model_runners loop"
            }
          ]
        }
      },
      {
        "id": "ranked_prediction_set",
        "scale": "candidate_set",
        "semantic_role": "candidate structures ordered by monomer confidence",
        "shape": "ordered N_model candidates with structures and confidence fields",
        "glyph": "coordinates",
        "carries": [
          "descending monomer confidence order",
          "predicted structures and their metrics"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranked_order construction"
            },
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "get_confidence_metrics"
            }
          ]
        }
      },
      {
        "id": "final_prediction_set",
        "scale": "candidate_set",
        "semantic_role": "ranked candidate structures after configured Amber relaxation or unrelaxed pass-through",
        "shape": "ordered N_model candidates with selected relaxed coordinates",
        "glyph": "coordinates",
        "carries": [
          "relaxed coordinates for selected candidates",
          "unrelaxed coordinates for unselected candidates",
          "original rank order"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ModelsToRelax selection and ranked output writes"
            },
            {
              "source_ref": "af2_relax_code",
              "role": "implementation_evidence",
              "locator": "AmberRelaxation.process"
            }
          ]
        }
      },
      {
        "id": "prediction_artifact_bundle",
        "scale": "run",
        "semantic_role": "serialized prediction directory containing structures, confidences, raw results, features, and run metadata",
        "shape": "directory of PDB, mmCIF, JSON, pickle, and metadata files",
        "carries": [
          "ranked structure files",
          "confidence and predicted-aligned-error files",
          "raw feature and model-result dictionaries",
          "ranking, timing, and optional relaxation metadata"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "fasta_input",
        "representation_ref": "representations.fasta_sequence",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; fasta_path"
            }
          ]
        }
      },
      {
        "id": "raw_feature_bundle",
        "representation_ref": "representations.raw_feature_bundle",
        "scope_ref": "architecture",
        "role": "shared_model_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; feature_dict"
            }
          ]
        }
      },
      {
        "id": "model_predictions",
        "representation_ref": "representations.model_prediction_set",
        "scope_ref": "architecture",
        "role": "unranked_candidates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; prediction_result and unrelaxed_proteins"
            }
          ]
        }
      },
      {
        "id": "ranked_predictions",
        "representation_ref": "representations.ranked_prediction_set",
        "scope_ref": "architecture",
        "role": "confidence_ordered_candidates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranked_order"
            }
          ]
        }
      },
      {
        "id": "final_predictions",
        "representation_ref": "representations.final_prediction_set",
        "scope_ref": "architecture",
        "role": "postprocessed_candidates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; relaxed_pdbs and ranked output fallback"
            }
          ]
        }
      },
      {
        "id": "prediction_artifacts_output",
        "representation_ref": "representations.prediction_artifact_bundle",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; output file writes"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "fasta_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.fasta_enters_feature_pipeline"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.feature_pipeline"
        ]
      },
      "raw_feature_bundle": {
        "incomingRelationRefs": [
          "relations.feature_pipeline_produces_raw_feature_bundle"
        ],
        "outgoingRelationRefs": [
          "relations.raw_feature_bundle_enters_prediction_ensemble"
        ],
        "producerRefs": [
          "modules.feature_pipeline"
        ],
        "consumerRefs": [
          "modules.prediction_ensemble"
        ]
      },
      "model_predictions": {
        "incomingRelationRefs": [
          "relations.prediction_ensemble_produces_model_predictions"
        ],
        "outgoingRelationRefs": [
          "relations.model_predictions_enter_confidence_ranker"
        ],
        "producerRefs": [
          "modules.prediction_ensemble"
        ],
        "consumerRefs": [
          "modules.confidence_ranker"
        ]
      },
      "ranked_predictions": {
        "incomingRelationRefs": [
          "relations.confidence_ranker_produces_ranked_predictions"
        ],
        "outgoingRelationRefs": [
          "relations.ranked_predictions_enter_relaxation_stage"
        ],
        "producerRefs": [
          "modules.confidence_ranker"
        ],
        "consumerRefs": [
          "modules.relaxation_stage"
        ]
      },
      "final_predictions": {
        "incomingRelationRefs": [
          "relations.relaxation_stage_produces_final_predictions"
        ],
        "outgoingRelationRefs": [
          "relations.final_predictions_enter_artifact_exporter"
        ],
        "producerRefs": [
          "modules.relaxation_stage"
        ],
        "consumerRefs": [
          "modules.artifact_exporter"
        ]
      },
      "prediction_artifacts_output": {
        "incomingRelationRefs": [
          "relations.artifact_exporter_writes_prediction_artifacts"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.artifact_exporter"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [

      ]
    },
    "stateSemantics": {
    },
    "stateSemanticsBySite": {
    },
    "conditioning": [

    ],
    "scaleTransitions": [

    ],
    "trainingInference": {
      "objective": {
        "kind": "composite_structure_and_auxiliary_losses",
        "notes": [
          "Training combines structure losses with auxiliary heads and incorporates self-distillation examples.",
          "This first source-set wave models the released monomer inference boundary; training internals remain outside the root board."
        ]
      },
      "schedule": {
        "kind": "staged_supervised_and_self_distillation"
      },
      "sampler": {
        "kind": "monomer_ensemble_with_recycling",
        "configurable": true
      },
      "teacher_forcing": "none",
      "self_conditioning": "recycled_previous_predictions",
      "checkpoint_notes": [
        "The released runner loads separately parameterized monomer model configurations and ranks their predictions.",
        "Exact training-loop implementation is not included in the released inference repository and will remain paper-backed when expanded."
      ],
      "evidence": {
        "status": "confirmed_from_paper",
        "refs": [
          {
            "source_ref": "af2_2021_supplement",
            "role": "training_and_inference_evidence",
            "locator": "Supplementary Methods 1.3 and 1.9-1.11; Algorithms 2 and 30-32"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "fasta_enters_feature_pipeline",
        "from": "value_sites.fasta_input",
        "to": "modules.feature_pipeline",
        "kind": "data_flow",
        "carries": [
          "representations.fasta_sequence"
        ],
        "operation": "parse_monomer_fasta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; data_pipeline.process call"
            }
          ]
        }
      },
      {
        "id": "feature_pipeline_produces_raw_feature_bundle",
        "from": "modules.feature_pipeline",
        "to": "value_sites.raw_feature_bundle",
        "kind": "data_flow",
        "carries": [
          "representations.raw_feature_bundle"
        ],
        "operation": "assemble_sequence_msa_and_template_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_data_pipeline_code",
              "role": "implementation_evidence",
              "locator": "DataPipeline.process"
            }
          ]
        }
      },
      {
        "id": "raw_feature_bundle_enters_prediction_ensemble",
        "from": "value_sites.raw_feature_bundle",
        "to": "modules.prediction_ensemble",
        "kind": "data_flow",
        "carries": [
          "representations.raw_feature_bundle"
        ],
        "operation": "process_features_per_model",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; model_runner.process_features call"
            },
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "RunModel.process_features"
            }
          ]
        }
      },
      {
        "id": "prediction_ensemble_produces_model_predictions",
        "from": "modules.prediction_ensemble",
        "to": "value_sites.model_predictions",
        "kind": "data_flow",
        "carries": [
          "representations.model_prediction_set"
        ],
        "operation": "collect_structure_and_confidence_predictions",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; model_runners loop"
            },
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "RunModel.predict"
            }
          ]
        }
      },
      {
        "id": "model_predictions_enter_confidence_ranker",
        "from": "value_sites.model_predictions",
        "to": "modules.confidence_ranker",
        "kind": "data_flow",
        "carries": [
          "representations.model_prediction_set"
        ],
        "operation": "read_candidate_ranking_confidences",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranking_confidences"
            }
          ]
        }
      },
      {
        "id": "confidence_ranker_produces_ranked_predictions",
        "from": "modules.confidence_ranker",
        "to": "value_sites.ranked_predictions",
        "kind": "data_flow",
        "carries": [
          "representations.ranked_prediction_set"
        ],
        "operation": "sort_candidates_by_mean_plddt",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranked_order construction"
            },
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "get_confidence_metrics; non-multimer branch"
            }
          ]
        }
      },
      {
        "id": "ranked_predictions_enter_relaxation_stage",
        "from": "value_sites.ranked_predictions",
        "to": "modules.relaxation_stage",
        "kind": "data_flow",
        "carries": [
          "representations.ranked_prediction_set"
        ],
        "operation": "select_best_all_or_none_for_relaxation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ModelsToRelax selection"
            }
          ]
        }
      },
      {
        "id": "relaxation_stage_produces_final_predictions",
        "from": "modules.relaxation_stage",
        "to": "value_sites.final_predictions",
        "kind": "data_flow",
        "carries": [
          "representations.final_prediction_set"
        ],
        "operation": "combine_relaxed_and_unrelaxed_candidates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; relaxed_pdbs and ranked output fallback"
            },
            {
              "source_ref": "af2_relax_code",
              "role": "implementation_evidence",
              "locator": "AmberRelaxation.process"
            }
          ]
        }
      },
      {
        "id": "final_predictions_enter_artifact_exporter",
        "from": "value_sites.final_predictions",
        "to": "modules.artifact_exporter",
        "kind": "data_flow",
        "carries": [
          "representations.final_prediction_set"
        ],
        "operation": "assemble_ordered_prediction_artifacts",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranked structure and metadata writes"
            }
          ]
        }
      },
      {
        "id": "artifact_exporter_writes_prediction_artifacts",
        "from": "modules.artifact_exporter",
        "to": "value_sites.prediction_artifacts_output",
        "kind": "data_flow",
        "carries": [
          "representations.prediction_artifact_bundle"
        ],
        "operation": "serialize_prediction_directory",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; output file writes"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "monomer_candidates_are_ranked_by_mean_plddt",
        "statement": "The released monomer path ranks candidate predictions by mean per-residue pLDDT rather than the multimer ipTM-weighted score.",
        "scope": {
          "module_ref": "modules.confidence_ranker"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_model_wrapper_code",
              "role": "implementation_evidence",
              "locator": "get_confidence_metrics"
            },
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; ranked_order construction"
            }
          ]
        }
      },
      {
        "id": "relaxation_is_optional_postprocessing",
        "statement": "Amber relaxation operates after confidence ranking and does not feed coordinates back into AlphaFold model inference.",
        "scope": {
          "module_ref": "modules.relaxation_stage"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af2_runner_code",
              "role": "implementation_evidence",
              "locator": "predict_structure; model loop, ranked_order, and relaxation loop"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "partition_first_model_drilldown",
        "question": "How should the first prediction-ensemble drilldown divide paper Algorithm 2 between recycling control and one AlphaFoldIteration execution?",
        "status": "deferred",
        "affected_refs": [
          "modules.prediction_ensemble"
        ],
        "blocking": false,
        "resolution_criteria": "Align the Algorithm 2 and Algorithms 30-32 scopes with the released AlphaFold and AlphaFoldIteration call boundary while keeping recycled before/after value sites distinct.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "af2_2021_supplement",
              "role": "architecture_context",
              "locator": "Algorithms 2 and 30-32"
            },
            {
              "source_ref": "af2_model_code",
              "role": "implementation_context",
              "locator": "AlphaFold and AlphaFoldIteration"
            }
          ]
        }
      }
    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
  },
  "pseudocode": {
    "alphafold2": {
      "schemaVersion": "pseudocode-v0.2",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "alphafold2",
      "title": "AlphaFold 2 Monomer Prediction Trace",
      "rootScope": "scopes.monomer_prediction",
      "sources": [
        {
          "id": "runner_code",
          "source_ref": "af2_runner_code"
        },
        {
          "id": "data_pipeline_code",
          "source_ref": "af2_data_pipeline_code"
        },
        {
          "id": "model_wrapper_code",
          "source_ref": "af2_model_wrapper_code"
        },
        {
          "id": "model_code",
          "source_ref": "af2_model_code"
        },
        {
          "id": "relax_code",
          "source_ref": "af2_relax_code"
        }
      ],
      "scopes": [
        {
          "id": "monomer_prediction",
          "ref": "scopes.monomer_prediction",
          "label": "AlphaFold 2 monomer prediction",
          "kind": "program",
          "parentRef": "pseudocode",
          "subjectRef": "architecture"
        }
      ],
      "symbols": [
        {
          "id": "fasta_input",
          "name": "fasta_path",
          "type": "input",
          "shape": "N_res residues",
          "representationRef": "representations.fasta_sequence",
          "scale": "protein",
          "glyph": "vector",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.fasta_input"
        },
        {
          "id": "raw_feature_bundle",
          "name": "raw_features",
          "type": "representation",
          "shape": "dictionary of sequence, MSA, template, mask, and metadata arrays",
          "representationRef": "representations.raw_feature_bundle",
          "scale": "protein",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.raw_feature_bundle"
        },
        {
          "id": "model_predictions",
          "name": "predictions",
          "type": "representation",
          "shape": "N_model candidates with N_res x 37 x 3 atom coordinates and confidence fields",
          "representationRef": "representations.model_prediction_set",
          "scale": "candidate_set",
          "glyph": "coordinates",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.model_predictions"
        },
        {
          "id": "ranked_predictions",
          "name": "ranked_predictions",
          "type": "representation",
          "shape": "ordered N_model candidates with structures and confidence fields",
          "representationRef": "representations.ranked_prediction_set",
          "scale": "candidate_set",
          "glyph": "coordinates",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.ranked_predictions"
        },
        {
          "id": "final_predictions",
          "name": "final_predictions",
          "type": "representation",
          "shape": "ordered N_model candidates with selected relaxed coordinates",
          "representationRef": "representations.final_prediction_set",
          "scale": "candidate_set",
          "glyph": "coordinates",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.final_predictions"
        },
        {
          "id": "prediction_artifacts_output",
          "name": "artifacts",
          "type": "output",
          "shape": "directory of PDB, mmCIF, JSON, pickle, and metadata files",
          "representationRef": "representations.prediction_artifact_bundle",
          "scale": "run",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.prediction_artifacts_output"
        }
      ],
      "lines": [
        {
          "id": "build_raw_features",
          "text": "raw_features = FeaturePipeline(fasta_path)",
          "comment": "Parse one sequence, search sequence databases, find templates, and assemble their raw features.",
          "refs": "predict_structure; data_pipeline.process call, DataPipeline.process",
          "sourceRefs": [
            {
              "source": "runner_code",
              "locator": "predict_structure; data_pipeline.process call"
            },
            {
              "source": "data_pipeline_code",
              "locator": "DataPipeline.process"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.feature_pipeline",
          "architectureRefs": [
            "modules.feature_pipeline",
            "relations.fasta_enters_feature_pipeline",
            "relations.feature_pipeline_produces_raw_feature_bundle"
          ],
          "operation": "build_sequence_msa_template_features",
          "inputs": [
            "fasta_input"
          ],
          "outputs": [
            "raw_feature_bundle"
          ],
          "codeBindings": [
            {
              "lexeme": "raw_features",
              "access": "write",
              "symbolId": "raw_feature_bundle",
              "architectureRef": "value_sites.raw_feature_bundle",
              "occurrences": [
                {
                  "start": 0,
                  "end": 12
                }
              ]
            },
            {
              "lexeme": "FeaturePipeline",
              "access": "call",
              "architectureRef": "modules.feature_pipeline",
              "occurrences": [
                {
                  "start": 15,
                  "end": 30
                }
              ]
            },
            {
              "lexeme": "fasta_path",
              "access": "read",
              "symbolId": "fasta_input",
              "architectureRef": "value_sites.fasta_input",
              "occurrences": [
                {
                  "start": 31,
                  "end": 41
                }
              ]
            }
          ]
        },
        {
          "id": "run_prediction_ensemble",
          "text": "predictions = PredictionEnsemble(raw_features)",
          "comment": "Process the shared features separately for each configured monomer model, then execute ensemble-aware recycling inference.",
          "refs": "predict_structure; model_runners loop, RunModel.process_features and RunModel.predict, AlphaFold.__call__; recycling and ensemble_representations execution",
          "sourceRefs": [
            {
              "source": "runner_code",
              "locator": "predict_structure; model_runners loop"
            },
            {
              "source": "model_wrapper_code",
              "locator": "RunModel.process_features and RunModel.predict"
            },
            {
              "source": "model_code",
              "locator": "AlphaFold.__call__; recycling and ensemble_representations execution"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.prediction_ensemble",
          "architectureRefs": [
            "modules.prediction_ensemble",
            "relations.raw_feature_bundle_enters_prediction_ensemble",
            "relations.prediction_ensemble_produces_model_predictions"
          ],
          "operation": "ensemble_recycling_inference",
          "inputs": [
            "raw_feature_bundle"
          ],
          "outputs": [
            "model_predictions"
          ],
          "codeBindings": [
            {
              "lexeme": "predictions",
              "access": "write",
              "symbolId": "model_predictions",
              "architectureRef": "value_sites.model_predictions",
              "occurrences": [
                {
                  "start": 0,
                  "end": 11
                }
              ]
            },
            {
              "lexeme": "PredictionEnsemble",
              "access": "call",
              "architectureRef": "modules.prediction_ensemble",
              "occurrences": [
                {
                  "start": 14,
                  "end": 32
                }
              ]
            },
            {
              "lexeme": "raw_features",
              "access": "read",
              "symbolId": "raw_feature_bundle",
              "architectureRef": "value_sites.raw_feature_bundle",
              "occurrences": [
                {
                  "start": 33,
                  "end": 45
                }
              ]
            }
          ]
        },
        {
          "id": "rank_model_predictions",
          "text": "ranked_predictions = RankByConfidence(predictions)",
          "comment": "Monomer runs use mean pLDDT as ranking confidence and sort candidates in descending order.",
          "refs": "get_confidence_metrics; non-multimer ranking_confidence branch, predict_structure; ranked_order construction",
          "sourceRefs": [
            {
              "source": "model_wrapper_code",
              "locator": "get_confidence_metrics; non-multimer ranking_confidence branch"
            },
            {
              "source": "runner_code",
              "locator": "predict_structure; ranked_order construction"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.confidence_ranker",
          "architectureRefs": [
            "modules.confidence_ranker",
            "relations.model_predictions_enter_confidence_ranker",
            "relations.confidence_ranker_produces_ranked_predictions"
          ],
          "operation": "rank_by_mean_plddt",
          "inputs": [
            "model_predictions"
          ],
          "outputs": [
            "ranked_predictions"
          ],
          "codeBindings": [
            {
              "lexeme": "ranked_predictions",
              "access": "write",
              "symbolId": "ranked_predictions",
              "architectureRef": "value_sites.ranked_predictions",
              "occurrences": [
                {
                  "start": 0,
                  "end": 18
                }
              ]
            },
            {
              "lexeme": "RankByConfidence",
              "access": "call",
              "architectureRef": "modules.confidence_ranker",
              "occurrences": [
                {
                  "start": 21,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "predictions",
              "access": "read",
              "symbolId": "model_predictions",
              "architectureRef": "value_sites.model_predictions",
              "occurrences": [
                {
                  "start": 38,
                  "end": 49
                }
              ]
            }
          ]
        },
        {
          "id": "relax_or_pass_through",
          "text": "final_predictions = RelaxSelectedOrPassThrough(ranked_predictions)",
          "comment": "Relax the best, all, or none according to policy; retain the unrelaxed structure for every candidate not selected.",
          "refs": "predict_structure; ModelsToRelax selection and ranked output fallback, AmberRelaxation.process",
          "sourceRefs": [
            {
              "source": "runner_code",
              "locator": "predict_structure; ModelsToRelax selection and ranked output fallback"
            },
            {
              "source": "relax_code",
              "locator": "AmberRelaxation.process"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.relaxation_stage",
          "architectureRefs": [
            "modules.relaxation_stage",
            "relations.ranked_predictions_enter_relaxation_stage",
            "relations.relaxation_stage_produces_final_predictions"
          ],
          "operation": "optional_amber_relaxation",
          "inputs": [
            "ranked_predictions"
          ],
          "outputs": [
            "final_predictions"
          ],
          "codeBindings": [
            {
              "lexeme": "final_predictions",
              "access": "write",
              "symbolId": "final_predictions",
              "architectureRef": "value_sites.final_predictions",
              "occurrences": [
                {
                  "start": 0,
                  "end": 17
                }
              ]
            },
            {
              "lexeme": "RelaxSelectedOrPassThrough",
              "access": "call",
              "architectureRef": "modules.relaxation_stage",
              "occurrences": [
                {
                  "start": 20,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "ranked_predictions",
              "access": "read",
              "symbolId": "ranked_predictions",
              "architectureRef": "value_sites.ranked_predictions",
              "occurrences": [
                {
                  "start": 47,
                  "end": 65
                }
              ]
            }
          ]
        },
        {
          "id": "export_prediction_artifacts",
          "text": "artifacts = ExportPredictionArtifacts(final_predictions)",
          "comment": "Serialize ranked structures and the feature, confidence, ranking, timing, and optional relaxation records produced by the run.",
          "refs": "predict_structure; feature, result, confidence, structure, ranking, timing, and relaxation writes",
          "sourceRefs": [
            {
              "source": "runner_code",
              "locator": "predict_structure; feature, result, confidence, structure, ranking, timing, and relaxation writes"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.artifact_exporter",
          "architectureRefs": [
            "modules.artifact_exporter",
            "relations.final_predictions_enter_artifact_exporter",
            "relations.artifact_exporter_writes_prediction_artifacts"
          ],
          "operation": "serialize_prediction_artifacts",
          "inputs": [
            "final_predictions"
          ],
          "outputs": [
            "prediction_artifacts_output"
          ],
          "codeBindings": [
            {
              "lexeme": "artifacts",
              "access": "write",
              "symbolId": "prediction_artifacts_output",
              "architectureRef": "value_sites.prediction_artifacts_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "ExportPredictionArtifacts",
              "access": "call",
              "architectureRef": "modules.artifact_exporter",
              "occurrences": [
                {
                  "start": 12,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "final_predictions",
              "access": "read",
              "symbolId": "final_predictions",
              "architectureRef": "value_sites.final_predictions",
              "occurrences": [
                {
                  "start": 38,
                  "end": 55
                }
              ]
            }
          ]
        }
      ],
      "claims": [

      ],
      "sourceYaml": "../../pseudocode/alphafold2.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/alphafold2-semantic-zoom.view.yaml",
    "rootBoard": "monomer_prediction",
    "items": [
      {
        "id": "monomer_prediction",
        "title": "AlphaFold 2 Monomer Prediction",
        "summary": "A single-chain FASTA is expanded into sequence, MSA, and template features; an ensemble of recycling model runs predicts candidate structures and confidence; candidates are ranked, optionally relaxed, and exported as prediction artifacts.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 6,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 28,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "fasta_input",
            "ref": "value_sites.fasta_input",
            "label": "single-chain FASTA",
            "notation": ".fasta",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "feature_pipeline",
            "ref": "modules.feature_pipeline",
            "label": "MSA + template feature pipeline",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "raw_feature_bundle",
            "ref": "value_sites.raw_feature_bundle",
            "label": "raw feature bundle",
            "notation": "features",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "prediction_ensemble",
            "ref": "modules.prediction_ensemble",
            "label": "model ensemble + recycling",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "model_predictions",
            "ref": "value_sites.model_predictions",
            "label": "candidate structures + confidence",
            "notation": "predictions",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "confidence_ranker",
            "ref": "modules.confidence_ranker",
            "label": "confidence ranking",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "ranked_predictions",
            "ref": "value_sites.ranked_predictions",
            "label": "ranked candidates",
            "notation": "ranked",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "relaxation_stage",
            "ref": "modules.relaxation_stage",
            "label": "optional Amber relaxation",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "final_predictions",
            "ref": "value_sites.final_predictions",
            "label": "relaxed or unrelaxed candidates",
            "notation": "final",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "artifact_exporter",
            "ref": "modules.artifact_exporter",
            "label": "prediction artifact exporter",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          },
          {
            "id": "prediction_artifacts_output",
            "ref": "value_sites.prediction_artifacts_output",
            "label": "ranked structures + confidence files",
            "notation": "artifacts",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 6,
            "row": 3
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.fasta_enters_feature_pipeline"
            },
            "label": "amino-acid sequence",
            "connection": {
              "title": "Monomer sequence input",
              "role": "task boundary input",
              "inside": "The data pipeline parses exactly one FASTA sequence before launching database searches and template lookup."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_pipeline_produces_raw_feature_bundle"
            },
            "label": "sequence + MSA + templates",
            "connection": {
              "title": "Raw model features",
              "role": "shared pipeline output",
              "inside": "Sequence features are combined with deduplicated MSA features and featurized template hits for subsequent per-model processing."
            }
          },
          {
            "match": {
              "relation_ref": "relations.raw_feature_bundle_enters_prediction_ensemble"
            },
            "label": "shared raw features",
            "connection": {
              "title": "Features enter model execution",
              "role": "ensemble input",
              "inside": "Each configured monomer model processes the shared raw bundle with its own seed before running its recycling inference path."
            }
          },
          {
            "match": {
              "relation_ref": "relations.prediction_ensemble_produces_model_predictions"
            },
            "label": "structures + confidence",
            "connection": {
              "title": "Candidate model outputs",
              "role": "ensemble result set",
              "inside": "Each model run returns atom coordinates and confidence outputs, including per-residue pLDDT and the scalar used for ranking."
            }
          },
          {
            "match": {
              "relation_ref": "relations.model_predictions_enter_confidence_ranker"
            },
            "label": "candidate scores",
            "connection": {
              "title": "Confidence inputs",
              "role": "candidate comparison",
              "inside": "The ranker reads the monomer ranking confidence attached to every candidate while retaining the associated predicted structure."
            }
          },
          {
            "match": {
              "relation_ref": "relations.confidence_ranker_produces_ranked_predictions"
            },
            "label": "descending mean pLDDT",
            "connection": {
              "title": "Ranked candidate order",
              "role": "monomer selection order",
              "inside": "Monomer candidates are ordered by their mean predicted LDDT so the highest-confidence prediction is first."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ranked_predictions_enter_relaxation_stage"
            },
            "label": "best / all / none",
            "connection": {
              "title": "Relaxation policy",
              "role": "optional physical refinement",
              "inside": "The configured policy selects the best candidate, every candidate, or no candidates for Amber relaxation while preserving rank order."
            }
          },
          {
            "match": {
              "relation_ref": "relations.relaxation_stage_produces_final_predictions"
            },
            "label": "relaxed or pass-through",
            "connection": {
              "title": "Final structure variants",
              "role": "post-processing result",
              "inside": "Selected structures use their relaxed coordinates; candidates not selected for relaxation pass through in unrelaxed form."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_predictions_enter_artifact_exporter"
            },
            "label": "ordered structures + metadata",
            "connection": {
              "title": "Results enter serialization",
              "role": "artifact assembly",
              "inside": "The exporter pairs each ordered structure with its confidence values, ranking order, features, model outputs, timings, and optional relaxation metrics."
            }
          },
          {
            "match": {
              "relation_ref": "relations.artifact_exporter_writes_prediction_artifacts"
            },
            "label": "ranked outputs",
            "connection": {
              "title": "Prediction artifact directory",
              "role": "task boundary output",
              "inside": "The run writes ranked PDB and mmCIF structures alongside confidence JSON, raw result pickles, the feature bundle, ranking metadata, and timings."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_4e98a57e3ece",
            "from": "artifact_exporter",
            "to": "prediction_artifacts_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.artifact_exporter_writes_prediction_artifacts"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.artifact_exporter_writes_prediction_artifacts"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.prediction_artifact_bundle"
            ],
            "presentation": {
              "label": "ranked outputs",
              "connection": {
                "title": "Prediction artifact directory",
                "role": "task boundary output",
                "inside": "The run writes ranked PDB and mmCIF structures alongside confidence JSON, raw result pickles, the feature bundle, ranking metadata, and timings."
              }
            }
          },
          {
            "id": "projection_553fc376c83b",
            "from": "confidence_ranker",
            "to": "ranked_predictions",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.confidence_ranker_produces_ranked_predictions"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.confidence_ranker_produces_ranked_predictions"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ranked_prediction_set"
            ],
            "presentation": {
              "label": "descending mean pLDDT",
              "connection": {
                "title": "Ranked candidate order",
                "role": "monomer selection order",
                "inside": "Monomer candidates are ordered by their mean predicted LDDT so the highest-confidence prediction is first."
              }
            }
          },
          {
            "id": "projection_7d54931630fe",
            "from": "fasta_input",
            "to": "feature_pipeline",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.fasta_enters_feature_pipeline"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.fasta_enters_feature_pipeline"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.fasta_sequence"
            ],
            "presentation": {
              "label": "amino-acid sequence",
              "connection": {
                "title": "Monomer sequence input",
                "role": "task boundary input",
                "inside": "The data pipeline parses exactly one FASTA sequence before launching database searches and template lookup."
              }
            }
          },
          {
            "id": "projection_fd63652b20d9",
            "from": "feature_pipeline",
            "to": "raw_feature_bundle",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.feature_pipeline_produces_raw_feature_bundle"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_pipeline_produces_raw_feature_bundle"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.raw_feature_bundle"
            ],
            "presentation": {
              "label": "sequence + MSA + templates",
              "connection": {
                "title": "Raw model features",
                "role": "shared pipeline output",
                "inside": "Sequence features are combined with deduplicated MSA features and featurized template hits for subsequent per-model processing."
              }
            }
          },
          {
            "id": "projection_dc5acf5cbd91",
            "from": "final_predictions",
            "to": "artifact_exporter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.final_predictions_enter_artifact_exporter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_predictions_enter_artifact_exporter"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.final_prediction_set"
            ],
            "presentation": {
              "label": "ordered structures + metadata",
              "connection": {
                "title": "Results enter serialization",
                "role": "artifact assembly",
                "inside": "The exporter pairs each ordered structure with its confidence values, ranking order, features, model outputs, timings, and optional relaxation metrics."
              }
            }
          },
          {
            "id": "projection_08f70e669d3d",
            "from": "model_predictions",
            "to": "confidence_ranker",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.model_predictions_enter_confidence_ranker"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.model_predictions_enter_confidence_ranker"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.model_prediction_set"
            ],
            "presentation": {
              "label": "candidate scores",
              "connection": {
                "title": "Confidence inputs",
                "role": "candidate comparison",
                "inside": "The ranker reads the monomer ranking confidence attached to every candidate while retaining the associated predicted structure."
              }
            }
          },
          {
            "id": "projection_1a6bf8767568",
            "from": "prediction_ensemble",
            "to": "model_predictions",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.prediction_ensemble_produces_model_predictions"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.prediction_ensemble_produces_model_predictions"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.model_prediction_set"
            ],
            "presentation": {
              "label": "structures + confidence",
              "connection": {
                "title": "Candidate model outputs",
                "role": "ensemble result set",
                "inside": "Each model run returns atom coordinates and confidence outputs, including per-residue pLDDT and the scalar used for ranking."
              }
            }
          },
          {
            "id": "projection_bbb8f6a08e10",
            "from": "ranked_predictions",
            "to": "relaxation_stage",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.ranked_predictions_enter_relaxation_stage"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ranked_predictions_enter_relaxation_stage"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ranked_prediction_set"
            ],
            "presentation": {
              "label": "best / all / none",
              "connection": {
                "title": "Relaxation policy",
                "role": "optional physical refinement",
                "inside": "The configured policy selects the best candidate, every candidate, or no candidates for Amber relaxation while preserving rank order."
              }
            }
          },
          {
            "id": "projection_f6292b9ea156",
            "from": "raw_feature_bundle",
            "to": "prediction_ensemble",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.raw_feature_bundle_enters_prediction_ensemble"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.raw_feature_bundle_enters_prediction_ensemble"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.raw_feature_bundle"
            ],
            "presentation": {
              "label": "shared raw features",
              "connection": {
                "title": "Features enter model execution",
                "role": "ensemble input",
                "inside": "Each configured monomer model processes the shared raw bundle with its own seed before running its recycling inference path."
              }
            }
          },
          {
            "id": "projection_f7e65e18aa14",
            "from": "relaxation_stage",
            "to": "final_predictions",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.relaxation_stage_produces_final_predictions"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.relaxation_stage_produces_final_predictions"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.final_prediction_set"
            ],
            "presentation": {
              "label": "relaxed or pass-through",
              "connection": {
                "title": "Final structure variants",
                "role": "post-processing result",
                "inside": "Selected structures use their relaxed coordinates; candidates not selected for relaxation pass through in unrelaxed form."
              }
            }
          }
        ],
        "classifications": {
          "modules.artifact_exporter": "visible",
          "modules.confidence_ranker": "visible",
          "modules.feature_pipeline": "visible",
          "modules.prediction_ensemble": "visible",
          "modules.relaxation_stage": "visible",
          "value_sites.fasta_input": "visible",
          "value_sites.final_predictions": "visible",
          "value_sites.model_predictions": "visible",
          "value_sites.prediction_artifacts_output": "visible",
          "value_sites.ranked_predictions": "visible",
          "value_sites.raw_feature_bundle": "visible"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
