export const manifest = {
  "architecture": {
    "id": "genie3_model",
    "name": "Genie 3 Token-Frame Denoiser",
    "status": "partial",
    "sourceYaml": "../../architectures/genie3-model.yaml",
    "modules": [
      {
        "id": "feature_pipeline",
        "label": "Feature pipelines",
        "kind": "data_pipeline",
        "scale": "residue",
        "role": "choose CA-only or atomized tokenization and set conditioning masks",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/data/feature_pipeline/motif.py",
              "lines": "104-134"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/data/feature_pipeline/target.py",
              "lines": "185-236,278-307"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/data/feature_pipeline/sidechain.py",
              "lines": "80-92"
            }
          ]
        }
      },
      {
        "id": "atomize_selected_residues",
        "label": "Atomize selected residues",
        "kind": "operation",
        "scale": "token",
        "role": "expand known residues to CA plus sidechain heavy atom tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "123-165"
            }
          ]
        }
      },
      {
        "id": "frame_builder",
        "label": "Token frame builder",
        "kind": "geometry",
        "scale": "token",
        "role": "build per-token Frenet frames from current or conditional coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "1053-1148"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/geo_utils.py",
              "lines": "15-174"
            }
          ]
        }
      },
      {
        "id": "single_feature_net",
        "label": "V1SingleFeatureNet",
        "kind": "embedder",
        "scale": "token",
        "role": "embed token index, residue identity, atom identity, masks, and timestep",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "70-115"
            }
          ]
        }
      },
      {
        "id": "pair_feature_net",
        "label": "V1PairFeatureNet",
        "kind": "embedder",
        "scale": "token_pair",
        "role": "build token-pair features from relative indices, noisy frames, and conditional frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py",
              "lines": "96-183"
            }
          ]
        }
      },
      {
        "id": "latent_transformer",
        "label": "LatentTransformer",
        "kind": "trunk",
        "scale": "token_pair",
        "role": "update token single and pair representations before structure decoding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "53-57"
            }
          ]
        }
      },
      {
        "id": "sequence_net",
        "label": "SequenceNet",
        "kind": "head",
        "scale": "token",
        "role": "predict amino-acid logits from token single representations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "55-60"
            }
          ]
        }
      },
      {
        "id": "structure_net",
        "label": "StructureNet",
        "kind": "decoder",
        "scale": "token",
        "role": "run IPA structure layers and return final token-frame translations",
        "contains": [
          {
            "id": "ipa_layers",
            "label": "InvariantPointAttention",
            "role": "use current token frames to update single representations"
          },
          {
            "id": "backbone_update",
            "label": "BackboneUpdate",
            "role": "predict quaternion and translation frame updates per token"
          }
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "28-88,168-170"
            }
          ]
        }
      },
      {
        "id": "backbone_update",
        "label": "BackboneUpdate",
        "kind": "frame_update",
        "scale": "token",
        "role": "predict a local SE(3) update from each token single representation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/module/backbone_update.py",
              "lines": "62-77"
            }
          ]
        }
      },
      {
        "id": "diffusion_sampler",
        "label": "Diffusion sampler",
        "kind": "sampler",
        "scale": "coordinate",
        "role": "carry Cartesian token coordinates across reverse diffusion steps",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/sampler/sampler.py",
              "lines": "97-121"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/sampler/ddim.py",
              "lines": "112-153"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "input_structure",
        "scale": "residue",
        "semantic_role": "parsed chain residues plus task conditioning flags",
        "shape": "n_res residues with residue type, atom list, masks, and coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "43-81"
            }
          ]
        }
      },
      {
        "id": "tokenized_coordinates",
        "scale": "token",
        "semantic_role": "flat coordinate state; CA for every residue plus sidechain heavy atoms for atomized residues",
        "shape": "B x N_token x 3",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "123-165,202-212"
            }
          ]
        }
      },
      {
        "id": "token_topology",
        "scale": "token",
        "semantic_role": "token indices, residue indices, chain IDs, atomization flags, and conditioning masks",
        "shape": "B x N_token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "202-212"
            }
          ]
        }
      },
      {
        "id": "atom_type_features",
        "scale": "token",
        "semantic_role": "one-hot atom name and atom element features for each token",
        "shape": "B x N_token x d_atom_type",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/np/protein_constants.py",
              "lines": "15-144"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "123-165"
            }
          ]
        }
      },
      {
        "id": "residue_identity",
        "scale": "token",
        "semantic_role": "residue one-hot repeated across all tokens belonging to a known residue",
        "shape": "B x N_token x 20",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "143-148,184-188"
            }
          ]
        }
      },
      {
        "id": "token_frames",
        "scale": "token",
        "semantic_role": "per-token Frenet-style rigid frames derived from current coordinates",
        "shape": "B x N_token x (R,t)",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "1053-1148"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/geo_utils.py",
              "lines": "15-142"
            }
          ]
        }
      },
      {
        "id": "conditional_structure_frames",
        "scale": "token",
        "semantic_role": "clean conditioning geometry converted into frames for template-like pair features",
        "shape": "B x N_token x (R,t)",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/geo_utils.py",
              "lines": "151-174"
            }
          ]
        }
      },
      {
        "id": "token_single_repr",
        "scale": "token",
        "semantic_role": "single token representation for CA and sidechain atom tokens",
        "shape": "B x N_token x c_s",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "70-115"
            }
          ]
        }
      },
      {
        "id": "token_pair_repr",
        "scale": "token_pair",
        "semantic_role": "pair representation over the flat token axis, including sidechain-token rows and columns",
        "shape": "B x N_token x N_token x c_z",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py",
              "lines": "96-183"
            }
          ]
        }
      },
      {
        "id": "sequence_logits",
        "scale": "token",
        "semantic_role": "amino-acid logits produced from final single representations",
        "shape": "B x N_token x 20",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "55-60"
            }
          ]
        }
      },
      {
        "id": "coordinate_output",
        "scale": "coordinate",
        "semantic_role": "final frame translations used as denoised token coordinates",
        "shape": "B x N_token x 3",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "168-170"
            }
          ]
        }
      }
    ],
    "execution": {
      "loops": [
        {
          "id": "diffusion_sampling_loop",
          "repeats": "diffusion_timesteps",
          "reruns": [
            "frame_builder",
            "single_feature_net",
            "pair_feature_net",
            "latent_transformer",
            "sequence_net",
            "structure_net"
          ],
          "cached": [
            "token_topology",
            "residue_identity",
            "atom_type_features"
          ],
          "notes": [
            "The sampler carries Cartesian token coordinates across diffusion steps.",
            "At each denoiser call, Genie 3 recomputes token frames from the current coordinates, then runs the single/pair trunk and structure stack.",
            "Frame rotations are internal to one denoiser call; only final translations are returned to the sampler."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/sampler/sampler.py",
                "lines": "97-121"
              },
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
                "lines": "51-60"
              },
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
                "lines": "79-88,168-170"
              }
            ]
          }
        }
      ],
      "cached_state": [
        {
          "id": "token_topology",
          "produced_by": "feature_pipeline",
          "consumed_by": [
            "frame_builder",
            "single_feature_net",
            "pair_feature_net",
            "structure_net"
          ],
          "scope": "sample_or_training_item",
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
                "lines": "123-165,1053-1148"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "input_structure": {
        "role": "task_input_structure_or_sample_config",
        "produced_by": "dataset_or_sample_config",
        "updated_by": [

        ],
        "consumed_by": [
          "feature_pipeline"
        ],
        "notes": [
          "In motif and binder tasks, task flags decide which residues are conditioned and which are atomized.",
          "In sidechain packing, known residues are atomized while backbone/CA coordinates are conditioning structure."
        ]
      },
      "tokenized_coordinates": {
        "role": "mutable_diffusion_state",
        "produced_by": [
          "feature_pipeline",
          "diffusion_sampler"
        ],
        "updated_by": [
          "diffusion_sampler"
        ],
        "consumed_by": [
          "frame_builder",
          "pair_feature_net",
          "structure_net"
        ],
        "notes": [
          "One coordinate is stored per token, not a dense atom14 tensor per residue.",
          "Non-atomized residues contribute one CA token; atomized residues contribute CA plus sidechain heavy atom tokens."
        ]
      },
      "token_frames": {
        "role": "derived_internal_state",
        "produced_by": [
          "frame_builder"
        ],
        "updated_by": [
          "structure_net"
        ],
        "consumed_by": [
          "pair_feature_net",
          "structure_net"
        ],
        "notes": [
          "Frames are recomputed from coordinates at the start of each denoiser call.",
          "Structure layers update rotations and translations internally, but only translations are returned."
        ]
      },
      "token_single_repr": {
        "role": "mutable_token_single_state",
        "produced_by": [
          "single_feature_net"
        ],
        "updated_by": [
          "latent_transformer",
          "structure_net"
        ],
        "consumed_by": [
          "latent_transformer",
          "sequence_net",
          "structure_net"
        ]
      },
      "token_pair_repr": {
        "role": "mutable_token_pair_state",
        "produced_by": [
          "pair_feature_net"
        ],
        "updated_by": [
          "latent_transformer"
        ],
        "consumed_by": [
          "latent_transformer",
          "structure_net"
        ],
        "notes": [
          "The pair axis is token-token. Sidechain atom tokens receive their own rows and columns."
        ]
      },
      "conditional_structure_frames": {
        "role": "read_only_conditioning_geometry",
        "produced_by": [
          "frame_builder"
        ],
        "updated_by": [

        ],
        "consumed_by": [
          "pair_feature_net"
        ],
        "notes": [
          "Conditional frames are computed from clean coordinates masked by cond_struct_mask."
        ]
      },
      "residue_identity": {
        "role": "sequence_conditioning_or_prediction_target",
        "produced_by": [
          "feature_pipeline",
          "sequence_net"
        ],
        "updated_by": [
          "sequence_net"
        ],
        "consumed_by": [
          "single_feature_net",
          "sequence_net"
        ]
      },
      "atom_type_features": {
        "role": "token_identity_features",
        "produced_by": [
          "feature_pipeline"
        ],
        "updated_by": [

        ],
        "consumed_by": [
          "single_feature_net"
        ],
        "notes": [
          "Atomized sidechain tokens carry atom-type and atom-symbol features such as CB, OG, SG, SD, or NZ."
        ]
      },
      "coordinate_output": {
        "role": "denoised_token_coordinate_prediction",
        "produced_by": [
          "structure_net"
        ],
        "updated_by": [

        ],
        "consumed_by": [
          "diffusion_sampler",
          "losses"
        ]
      },
      "sequence_logits": {
        "role": "auxiliary_sequence_prediction",
        "produced_by": [
          "sequence_net"
        ],
        "updated_by": [

        ],
        "consumed_by": [
          "sequence_loss",
          "postprocess"
        ]
      }
    },
    "conditioning": [
      {
        "id": "residue_identity_to_single",
        "source": "residue_identity",
        "target": "single_feature_net",
        "mode": "additive_feature_concat",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "90-115"
            }
          ]
        }
      },
      {
        "id": "atom_type_to_single",
        "source": "atom_type_features",
        "target": "single_feature_net",
        "mode": "additive_feature_concat",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "96-115"
            }
          ]
        }
      },
      {
        "id": "conditional_geometry_to_pair",
        "source": "conditional_structure_frames",
        "target": "pair_feature_net",
        "mode": "template_geometry_encoding",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py",
              "lines": "163-183"
            }
          ]
        }
      },
      {
        "id": "current_frames_to_ipa",
        "source": "token_frames",
        "target": "structure_net.ipa",
        "mode": "invariant_point_attention_frames",
        "updates_source": true,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "79-88"
            }
          ]
        }
      }
    ],
    "scaleTransitions": [
      {
        "id": "residue_to_flat_token_axis",
        "from_scale": "residue",
        "to_scale": "token",
        "source": "input_structure",
        "target": "tokenized_coordinates",
        "projection": "selected_residue_atomization",
        "aggregation": "expand_selected_residues",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "123-165"
            }
          ]
        }
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "token_coordinate_denoising",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/ddpm.py",
              "lines": "119-142"
            }
          ]
        }
      },
      "coordinate_state": {
        "kind": "cartesian_token_coordinates",
        "note": "The diffusion state is x_t with one 3D coordinate per token. It is not a persistent frame state."
      },
      "sidechain_tasks": {
        "kind": "known_identity_atomized_sidechain_reconstruction",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "/home/ruh/research/PhD/related_work/genie3/genie3_paper.pdf",
              "lines": "Section 3.2, Section 3.3, Appendix A.3.1, Appendix A.3.2"
            }
          ]
        }
      }
    },
    "edges": [
      {
        "from": "input_structure",
        "to": "feature_pipeline",
        "label": "task flags",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/data/feature_pipeline/motif.py",
              "lines": "104-134"
            }
          ]
        }
      },
      {
        "from": "feature_pipeline",
        "to": "atomize_selected_residues",
        "label": "residue masks",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/data/feature_pipeline/target.py",
              "lines": "185-236,278-307"
            }
          ]
        }
      },
      {
        "from": "atomize_selected_residues",
        "to": "tokenized_coordinates",
        "label": "flat tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py",
              "lines": "123-165"
            }
          ]
        }
      },
      {
        "from": "tokenized_coordinates",
        "to": "frame_builder",
        "label": "current coords",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "51"
            }
          ]
        }
      },
      {
        "from": "frame_builder",
        "to": "token_frames",
        "label": "frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/geo_utils.py",
              "lines": "101-142"
            }
          ]
        }
      },
      {
        "from": "token_topology",
        "to": "single_feature_net",
        "label": "masks and ids",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "70-115"
            }
          ]
        }
      },
      {
        "from": "atom_type_features",
        "to": "single_feature_net",
        "label": "atom identity",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "96-115"
            }
          ]
        }
      },
      {
        "from": "residue_identity",
        "to": "single_feature_net",
        "label": "residue identity",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/single/v1.py",
              "lines": "90-115"
            }
          ]
        }
      },
      {
        "from": "single_feature_net",
        "to": "token_single_repr",
        "label": "single init",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "53"
            }
          ]
        }
      },
      {
        "from": "token_frames",
        "to": "pair_feature_net",
        "label": "noisy geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py",
              "lines": "137-157"
            }
          ]
        }
      },
      {
        "from": "conditional_structure_frames",
        "to": "pair_feature_net",
        "label": "conditioned geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py",
              "lines": "163-183"
            }
          ]
        }
      },
      {
        "from": "pair_feature_net",
        "to": "token_pair_repr",
        "label": "pair init",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "54"
            }
          ]
        }
      },
      {
        "from": "token_single_repr",
        "to": "latent_transformer",
        "label": "si",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "55-57"
            }
          ]
        }
      },
      {
        "from": "token_pair_repr",
        "to": "latent_transformer",
        "label": "zij",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "55-57"
            }
          ]
        }
      },
      {
        "from": "latent_transformer",
        "to": "sequence_net",
        "label": "si",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "55-58"
            }
          ]
        }
      },
      {
        "from": "sequence_net",
        "to": "sequence_logits",
        "label": "logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "58-60"
            }
          ]
        }
      },
      {
        "from": "latent_transformer",
        "to": "structure_net",
        "label": "si, zij",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py",
              "lines": "59"
            }
          ]
        }
      },
      {
        "from": "token_frames",
        "to": "structure_net",
        "label": "frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "79-88"
            }
          ]
        }
      },
      {
        "from": "backbone_update",
        "to": "token_frames",
        "label": "quat + trans update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/module/backbone_update.py",
              "lines": "62-77"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "87-88"
            }
          ]
        }
      },
      {
        "from": "structure_net",
        "to": "coordinate_output",
        "label": "final translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py",
              "lines": "168-170"
            }
          ]
        }
      },
      {
        "from": "coordinate_output",
        "to": "diffusion_sampler",
        "label": "denoising direction",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/ddpm.py",
              "lines": "132-142"
            }
          ]
        }
      }
    ],
    "claims": [
      "Genie 3 represents atomized residues as CA plus sidechain heavy atom tokens, not dense per-residue atom14 slots.",
      "The single, pair, and IPA structure stack operate over the flat token axis, so atomized sidechain tokens receive their own single slots and pair rows/columns.",
      "Structure layers predict quaternion and translation updates, but the denoiser returns only final frame translations as token coordinates.",
      "Sidechain coordinate generation happens for atomized known-identity regions; unknown-sequence binder design is CA-token level rather than full sidechain token generation."
    ]
  },
  "standardBlocks": {
  },
  "pseudocode": {
    "genie3_model": {
      "sourceYaml": "../../pseudocode/genie3-model.yaml",
      "lines": [
        {
          "id": "choose_atomization",
          "text": "Task feature pipeline sets residue_cond_atomize_mask and conditioning masks.",
          "refs": "43-81, Section 3.2, Appendix A.3.1, Appendix A.3.2"
        },
        {
          "id": "emit_ca_token",
          "text": "Every residue emits a CA token with one coordinate.",
          "refs": "123-131"
        },
        {
          "id": "emit_sidechain_tokens",
          "text": "If atomized, append residue.atom_type[4:] and residue.gt_atom_positions[4:] as sidechain heavy atom tokens.",
          "refs": "134-165"
        },
        {
          "id": "sample_noisy_coordinates",
          "text": "x_t = sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise over gt_atom_positions.",
          "refs": "119-130"
        },
        {
          "id": "compute_frames",
          "text": "F_t = compute_noisy_structure_frames(batch, x_t) using center/left/right token frame indices.",
          "refs": "51, 1053-1148, 101-142"
        },
        {
          "id": "embed_single",
          "text": "s_i = SingleFeatureNet(token ids, timestep, residue identity when cond_seq_mask, atom type, masks).",
          "refs": "70-115"
        },
        {
          "id": "embed_pair",
          "text": "z_ij = PairFeatureNet(s_i, F_t, conditional frames, relative token metadata).",
          "refs": "96-183"
        },
        {
          "id": "latent_transform",
          "text": "s_i, z_ij = LatentTransformer(s_i, z_ij, token_mask).",
          "refs": "55-57"
        },
        {
          "id": "sequence_head",
          "text": "seq_logits = SequenceNet(s_i).",
          "refs": "58-60"
        },
        {
          "id": "ipa_structure_layer",
          "text": "StructureLayer runs IPA(s_i, z_ij, F_t), then StructureTransition.",
          "refs": "79-87"
        },
        {
          "id": "frame_update",
          "text": "Delta F = BackboneUpdate(s_i): Linear(s_i) -> quaternion update plus translation update.",
          "refs": "62-77"
        },
        {
          "id": "compose_frames",
          "text": "F_out = F_t.compose(Delta F) through all structure layers.",
          "refs": "87-88,168-170"
        },
        {
          "id": "return_translations",
          "text": "x_pred = F_out.trans; final rotations are not returned to the sampler.",
          "refs": "168-170"
        },
        {
          "id": "sampler_step",
          "text": "Sampler computes z_pred = x_t - x_pred and updates the Cartesian coordinate state.",
          "refs": "132-142"
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/genie3-semantic-zoom.view.yaml",
    "rootBoard": "genie3_overview",
    "items": [
      {
        "id": "genie3_overview",
        "title": "Genie3",
        "summary": "A one-block overview. Open the token-frame denoiser to inspect sparse atom-token sidechains, token frames, pair features, and IPA frame updates.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "token_frame_denoiser",
            "kind": "module",
            "label": "Token-frame denoiser",
            "scale": "abstract",
            "role": "coordinate diffusion over CA and selected sidechain atom tokens",
            "detail": "tokenize -> frames -> token pair trunk -> IPA translations",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "token_frame_denoiser",
        "title": "Genie3 Token-Frame Denoiser",
        "summary": "Genie3 tokenizes residues into a flat coordinate axis, derives frames from current coordinates, builds token single/pair features, and returns final frame translations.",
        "parent": "genie3_overview",
        "grid": {
          "columns": 7,
          "rows": 5
        },
        "nodes": [
          {
            "id": "input_structure",
            "kind": "representation",
            "rep_ref": "input_structure",
            "col": 1,
            "row": 3
          },
          {
            "id": "feature_pipeline",
            "kind": "module",
            "module_ref": "feature_pipeline",
            "col": 2,
            "row": 3,
            "expandable": true
          },
          {
            "id": "tokenized_coordinates",
            "kind": "representation",
            "rep_ref": "tokenized_coordinates",
            "col": 3,
            "row": 4
          },
          {
            "id": "token_topology",
            "kind": "representation",
            "rep_ref": "token_topology",
            "col": 3,
            "row": 2
          },
          {
            "id": "frame_builder",
            "kind": "module",
            "module_ref": "frame_builder",
            "col": 4,
            "row": 4,
            "expandable": true
          },
          {
            "id": "token_frames",
            "kind": "representation",
            "rep_ref": "token_frames",
            "col": 5,
            "row": 4
          },
          {
            "id": "single_feature_net",
            "kind": "module",
            "module_ref": "single_feature_net",
            "col": 4,
            "row": 2
          },
          {
            "id": "token_single_repr",
            "kind": "representation",
            "rep_ref": "token_single_repr",
            "col": 5,
            "row": 2
          },
          {
            "id": "pair_feature_net",
            "kind": "module",
            "module_ref": "pair_feature_net",
            "col": 5,
            "row": 3,
            "expandable": true
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "col": 6,
            "row": 3
          },
          {
            "id": "latent_transformer",
            "kind": "module",
            "module_ref": "latent_transformer",
            "col": 6,
            "row": 2
          },
          {
            "id": "sequence_net",
            "kind": "module",
            "module_ref": "sequence_net",
            "col": 7,
            "row": 1
          },
          {
            "id": "sequence_logits",
            "kind": "representation",
            "rep_ref": "sequence_logits",
            "col": 7,
            "row": 2
          },
          {
            "id": "structure_net",
            "kind": "module",
            "module_ref": "structure_net",
            "col": 7,
            "row": 4,
            "expandable": true
          },
          {
            "id": "coordinate_output",
            "kind": "representation",
            "rep_ref": "coordinate_output",
            "col": 7,
            "row": 5
          }
        ],
        "edges": [
          {
            "from": "input_structure",
            "to": "feature_pipeline",
            "label": "task flags",
            "connection": {
              "title": "Task flags choose tokenization",
              "role": "representation setup",
              "inside": "Motif, target, and sidechain feature pipelines decide which residues are conditioned, which residues are atomized, and which coordinates are structurally provided."
            }
          },
          {
            "from": "feature_pipeline",
            "to": "tokenized_coordinates",
            "label": "flat tokens",
            "connection": {
              "title": "Residues to token coordinates",
              "role": "sparse coordinate state",
              "inside": "Non-atomized residues emit one CA token; atomized residues emit CA plus sidechain heavy atom tokens."
            }
          },
          {
            "from": "feature_pipeline",
            "to": "token_topology",
            "label": "ids and masks",
            "connection": {
              "title": "Token topology",
              "role": "metadata for every token",
              "inside": "Token index, residue index, atomization flag, atom type, residue identity, and conditioning masks travel alongside the coordinate state."
            }
          },
          {
            "from": "tokenized_coordinates",
            "to": "frame_builder",
            "label": "current coords",
            "connection": {
              "title": "Coordinates define frames",
              "role": "derived internal geometry",
              "inside": "At each denoiser call, current token coordinates are gathered into center, left, and right anchors to form Frenet-style token frames."
            }
          },
          {
            "from": "frame_builder",
            "to": "token_frames",
            "label": "R,t",
            "connection": {
              "title": "Token frames",
              "role": "IPA geometry state",
              "inside": "The frame translation is the token coordinate; rotations are derived from neighboring CA or sidechain atom tokens."
            }
          },
          {
            "from": "token_topology",
            "to": "single_feature_net",
            "label": "token features",
            "connection": {
              "title": "Metadata to single features",
              "role": "token embedding",
              "inside": "Single features concatenate timestep, residue identity when conditioned, atom type, atom symbol, token masks, and conditioning masks."
            }
          },
          {
            "from": "single_feature_net",
            "to": "token_single_repr",
            "label": "si init",
            "connection": {
              "title": "Initial single representation",
              "role": "token state",
              "inside": "Every existing token gets one single slot, including sidechain heavy atom tokens."
            }
          },
          {
            "from": "token_frames",
            "to": "pair_feature_net",
            "label": "noisy geometry",
            "connection": {
              "title": "Current frame geometry into pairs",
              "role": "pair feature construction",
              "inside": "Pair features encode distances/orientations from the current token frames over the full token-token axis."
            }
          },
          {
            "from": "token_topology",
            "to": "pair_feature_net",
            "label": "relative ids",
            "connection": {
              "title": "Token topology into pairs",
              "role": "relative position features",
              "inside": "Pair features include relative chain, entity, residue, and token index encodings so atomized same-residue tokens still sit in the global token graph."
            }
          },
          {
            "from": "pair_feature_net",
            "to": "token_pair_repr",
            "label": "zij init",
            "connection": {
              "title": "Initial pair representation",
              "role": "token-token state",
              "inside": "The pair representation is N_token by N_token, so CA and sidechain atom tokens each own rows and columns."
            }
          },
          {
            "from": "token_single_repr",
            "to": "latent_transformer",
            "label": "si",
            "connection": {
              "title": "Single stream into trunk",
              "role": "mutable token state",
              "inside": "The latent transformer updates the token single stream before sequence and structure heads consume it."
            }
          },
          {
            "from": "token_pair_repr",
            "to": "latent_transformer",
            "label": "zij",
            "tone": "conditioning",
            "connection": {
              "title": "Pair stream into trunk",
              "role": "token pair state",
              "inside": "Pair features are updated by the trunk and later bias IPA through the structure stack."
            }
          },
          {
            "from": "latent_transformer",
            "to": "sequence_net",
            "label": "si",
            "connection": {
              "title": "Sequence head",
              "role": "auxiliary sequence prediction",
              "inside": "SequenceNet reads token single representations and produces amino-acid logits."
            }
          },
          {
            "from": "sequence_net",
            "to": "sequence_logits",
            "label": "logits",
            "connection": {
              "title": "Sequence output",
              "role": "auxiliary prediction",
              "inside": "Sequence logits can be used during sequence-prediction tasks and postprocessing."
            }
          },
          {
            "from": "latent_transformer",
            "to": "structure_net",
            "label": "si, zij",
            "connection": {
              "title": "Trunk output to structure stack",
              "role": "structure decoding state",
              "inside": "StructureNet consumes updated single and pair representations together with the current token frames."
            }
          },
          {
            "from": "token_frames",
            "to": "structure_net",
            "label": "frames",
            "tone": "conditioning",
            "connection": {
              "title": "Frames to IPA",
              "role": "invariant point attention geometry",
              "inside": "IPA reads the running token frames. Structure layers update rotations and translations internally."
            }
          },
          {
            "from": "structure_net",
            "to": "coordinate_output",
            "label": "translations",
            "connection": {
              "title": "Coordinate output",
              "role": "denoising output",
              "inside": "The denoiser returns final frame translations only. Final rotations are internal state, not persistent sampler state."
            }
          }
        ]
      },
      {
        "id": "feature_pipeline",
        "title": "Tokenization And Atomization",
        "summary": "Genie3 uses a sparse flat token list: one CA token for non-atomized residues and CA plus sidechain heavy atom tokens for atomized known residues.",
        "parent": "token_frame_denoiser",
        "grid": {
          "columns": 6,
          "rows": 4
        },
        "nodes": [
          {
            "id": "residue_tokens",
            "kind": "representation",
            "label": "residues",
            "scale": "residue",
            "role": "chain residues with known or unknown identity",
            "col": 1,
            "row": 2
          },
          {
            "id": "task_masks",
            "kind": "representation",
            "label": "task masks",
            "scale": "token",
            "role": "cond_group, atomize, include_backbone, include_sidechain",
            "col": 1,
            "row": 3
          },
          {
            "id": "atomize_selected_residues",
            "kind": "module",
            "module_ref": "atomize_selected_residues",
            "col": 3,
            "row": 2
          },
          {
            "id": "ca_only_tokens",
            "kind": "representation",
            "label": "CA-only scaffold",
            "scale": "token",
            "role": "one CA coordinate token per non-atomized residue",
            "shape": "CA",
            "col": 5,
            "row": 1
          },
          {
            "id": "atomized_tokens",
            "kind": "representation",
            "label": "atomized residue",
            "scale": "atom",
            "role": "CA plus sidechain heavy atom tokens",
            "shape": "CA + atom_type[4:]",
            "col": 5,
            "row": 2
          },
          {
            "id": "token_topology",
            "kind": "representation",
            "rep_ref": "token_topology",
            "col": 5,
            "row": 3
          },
          {
            "id": "atom_type_features",
            "kind": "representation",
            "rep_ref": "atom_type_features",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "residue_tokens",
            "to": "atomize_selected_residues",
            "label": "residue list",
            "connection": {
              "title": "Residues enter feature building",
              "role": "input chain topology",
              "inside": "Parsed residues provide residue type, canonical atom list, atom masks, and coordinates."
            }
          },
          {
            "from": "task_masks",
            "to": "atomize_selected_residues",
            "label": "atomize flags",
            "tone": "conditioning",
            "connection": {
              "title": "Task masks select token granularity",
              "role": "tokenization control",
              "inside": "A residue is expanded only when its task-specific atomization mask is true."
            }
          },
          {
            "from": "atomize_selected_residues",
            "to": "ca_only_tokens",
            "label": "not atomized",
            "connection": {
              "title": "CA-only path",
              "role": "scaffold representation",
              "inside": "Non-atomized residues contribute one CA token to the flat token axis."
            }
          },
          {
            "from": "atomize_selected_residues",
            "to": "atomized_tokens",
            "label": "atomized",
            "connection": {
              "title": "Sidechain token path",
              "role": "sparse atom-token expansion",
              "inside": "Atomized residues contribute CA plus every sidechain heavy atom in the residue atom list. Backbone N, C, and O are not generated tokens."
            }
          },
          {
            "from": "atomized_tokens",
            "to": "token_topology",
            "label": "shared residue id",
            "connection": {
              "title": "Atom tokens keep residue identity",
              "role": "topology metadata",
              "inside": "Sidechain atom tokens share residue index and residue type with their CA token while carrying distinct atom-type features."
            }
          },
          {
            "from": "atomized_tokens",
            "to": "atom_type_features",
            "label": "atom names",
            "connection": {
              "title": "Heavy atom identity",
              "role": "token identity features",
              "inside": "Tokens can be carbon, nitrogen, oxygen, or sulfur sidechain atoms such as CB, OG, SG, SD, or NZ."
            }
          }
        ]
      },
      {
        "id": "frame_builder",
        "title": "Token Frame Builder",
        "summary": "Frames are derived from the current coordinates at every denoiser call. They are not persistent sampler state.",
        "parent": "token_frame_denoiser",
        "grid": {
          "columns": 6,
          "rows": 4
        },
        "nodes": [
          {
            "id": "tokenized_coordinates",
            "kind": "representation",
            "rep_ref": "tokenized_coordinates",
            "col": 1,
            "row": 3
          },
          {
            "id": "frame_indices",
            "kind": "representation",
            "label": "center/left/right indices",
            "scale": "token",
            "role": "local anchor choices for each token",
            "col": 2,
            "row": 2
          },
          {
            "id": "ca_frame_rule",
            "kind": "operation",
            "label": "CA frame rule",
            "scale": "token",
            "role": "use neighboring CA tokens along the chain",
            "col": 3,
            "row": 1
          },
          {
            "id": "sidechain_frame_rule",
            "kind": "operation",
            "label": "sidechain frame rule",
            "scale": "atom",
            "role": "use adjacent same-residue atom tokens",
            "col": 3,
            "row": 3
          },
          {
            "id": "frame_builder",
            "kind": "module",
            "module_ref": "frame_builder",
            "col": 4,
            "row": 2
          },
          {
            "id": "token_frames",
            "kind": "representation",
            "rep_ref": "token_frames",
            "col": 6,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "tokenized_coordinates",
            "to": "frame_indices",
            "label": "token order",
            "connection": {
              "title": "Token order defines anchors",
              "role": "frame metadata",
              "inside": "Feature building stores, for each token, which coordinates serve as center, left, and right frame anchors."
            }
          },
          {
            "from": "frame_indices",
            "to": "ca_frame_rule",
            "label": "CA tokens",
            "connection": {
              "title": "Backbone trace frames",
              "role": "CA frame construction",
              "inside": "CA tokens use neighboring CA tokens along the chain, with terminal adjustments when needed."
            }
          },
          {
            "from": "frame_indices",
            "to": "sidechain_frame_rule",
            "label": "sidechain tokens",
            "connection": {
              "title": "Sidechain trace frames",
              "role": "atomized token frame construction",
              "inside": "Non-CA tokens use adjacent atom tokens with the same residue index, following the residue atom ordering."
            }
          },
          {
            "from": "ca_frame_rule",
            "to": "frame_builder",
            "label": "anchors",
            "connection": {
              "title": "CA anchors to frame builder",
              "role": "Frenet construction",
              "inside": "Center, left, and right coordinates form tangent, binormal, and normal axes."
            }
          },
          {
            "from": "sidechain_frame_rule",
            "to": "frame_builder",
            "label": "anchors",
            "connection": {
              "title": "Sidechain anchors to frame builder",
              "role": "Frenet construction",
              "inside": "Sidechain atom tokens get their own derived local frames before IPA sees them."
            }
          },
          {
            "from": "frame_builder",
            "to": "token_frames",
            "label": "R,t",
            "connection": {
              "title": "Derived token frames",
              "role": "internal geometry state",
              "inside": "The frame translation is the token coordinate, while the rotation is recomputed from local anchor geometry."
            }
          }
        ]
      },
      {
        "id": "pair_feature_net",
        "title": "Token Pair Features",
        "summary": "Pair features are built over the flat token axis. Atomized sidechain tokens have the same status as CA tokens in the pair grid.",
        "parent": "token_frame_denoiser",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "token_single_repr",
            "kind": "representation",
            "rep_ref": "token_single_repr",
            "col": 1,
            "row": 1
          },
          {
            "id": "token_topology",
            "kind": "representation",
            "rep_ref": "token_topology",
            "col": 1,
            "row": 2
          },
          {
            "id": "token_frames",
            "kind": "representation",
            "rep_ref": "token_frames",
            "col": 1,
            "row": 3
          },
          {
            "id": "conditional_structure_frames",
            "kind": "representation",
            "rep_ref": "conditional_structure_frames",
            "col": 1,
            "row": 4
          },
          {
            "id": "pair_feature_net",
            "kind": "module",
            "module_ref": "pair_feature_net",
            "col": 3,
            "row": 2
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "col": 5,
            "row": 2
          },
          {
            "id": "sidechain_rows",
            "kind": "representation",
            "label": "CA/CB/SG rows",
            "scale": "token_pair",
            "role": "pair rows and columns for all existing tokens",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "token_single_repr",
            "to": "pair_feature_net",
            "label": "outer single",
            "connection": {
              "title": "Single projections seed pair features",
              "role": "pair initialization",
              "inside": "Linear projections of token singles are outer-summed to initialize zij."
            }
          },
          {
            "from": "token_topology",
            "to": "pair_feature_net",
            "label": "relpos",
            "connection": {
              "title": "Relative token metadata",
              "role": "pair topology",
              "inside": "Relative position embeddings use token, residue, chain, symmetry, and entity indices."
            }
          },
          {
            "from": "token_frames",
            "to": "pair_feature_net",
            "label": "noisy frame template",
            "connection": {
              "title": "Current coordinate geometry",
              "role": "geometric pair features",
              "inside": "Pair features encode current-frame distances and relative orientations."
            }
          },
          {
            "from": "conditional_structure_frames",
            "to": "pair_feature_net",
            "label": "clean cond frames",
            "tone": "conditioning",
            "connection": {
              "title": "Conditional geometry path",
              "role": "template-like conditioning",
              "inside": "Clean conditioned coordinates are separately converted to frames and encoded for tokens in the same conditioning group."
            }
          },
          {
            "from": "pair_feature_net",
            "to": "token_pair_repr",
            "label": "N x N",
            "connection": {
              "title": "Token-token pair representation",
              "role": "full token pair state",
              "inside": "The output has shape B x N_token x N_token x c_z."
            }
          },
          {
            "from": "token_pair_repr",
            "to": "sidechain_rows",
            "label": "sidechain slots",
            "connection": {
              "title": "Atomized tokens own pair slots",
              "role": "sidechain-token interactions",
              "inside": "A CB or SG token has a row and column just like a CA token, so attention can relate sidechain atoms to CA tokens and other sidechain atoms."
            }
          }
        ]
      },
      {
        "id": "structure_net",
        "title": "IPA Structure Decoder",
        "summary": "Structure layers update token frames with learned quaternion and translation updates, but the denoiser returns only final translations.",
        "parent": "token_frame_denoiser",
        "grid": {
          "columns": 6,
          "rows": 4
        },
        "nodes": [
          {
            "id": "token_frames",
            "kind": "representation",
            "rep_ref": "token_frames",
            "col": 1,
            "row": 2
          },
          {
            "id": "token_single_repr",
            "kind": "representation",
            "rep_ref": "token_single_repr",
            "col": 1,
            "row": 1
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "col": 1,
            "row": 3
          },
          {
            "id": "ipa",
            "kind": "operation",
            "label": "IPA",
            "scale": "token",
            "role": "frame-aware token attention",
            "col": 3,
            "row": 2
          },
          {
            "id": "backbone_update",
            "kind": "module",
            "module_ref": "backbone_update",
            "col": 4,
            "row": 2
          },
          {
            "id": "updated_frames",
            "kind": "representation",
            "label": "updated frames",
            "scale": "coordinate",
            "role": "internal rotations and translations",
            "shape": "B x N_token x (R,t)",
            "col": 5,
            "row": 2
          },
          {
            "id": "coordinate_output",
            "kind": "representation",
            "rep_ref": "coordinate_output",
            "col": 6,
            "row": 2
          },
          {
            "id": "sampler_state",
            "kind": "representation",
            "label": "next sampler state",
            "scale": "coordinate",
            "role": "Cartesian x_{t-1}; rotations recomputed next call",
            "shape": "B x N_token x 3",
            "col": 6,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "token_frames",
            "to": "ipa",
            "label": "frames",
            "tone": "conditioning",
            "connection": {
              "title": "Frames into IPA",
              "role": "invariant geometry",
              "inside": "IPA uses token frames to place and compare learned point probes in 3D."
            }
          },
          {
            "from": "token_single_repr",
            "to": "ipa",
            "label": "si",
            "connection": {
              "title": "Single state into IPA",
              "role": "query token state",
              "inside": "IPA updates token singles using frame-aware attention."
            }
          },
          {
            "from": "token_pair_repr",
            "to": "ipa",
            "label": "zij",
            "tone": "conditioning",
            "connection": {
              "title": "Pair state into IPA",
              "role": "pair bias and geometry context",
              "inside": "Pair representation contributes to IPA attention and carries token-token context."
            }
          },
          {
            "from": "ipa",
            "to": "backbone_update",
            "label": "updated si",
            "connection": {
              "title": "IPA to frame update",
              "role": "structure transition",
              "inside": "The structure transition produces token singles that feed BackboneUpdate."
            }
          },
          {
            "from": "backbone_update",
            "to": "updated_frames",
            "label": "quat + trans",
            "connection": {
              "title": "Local SE(3) update",
              "role": "frame composition",
              "inside": "BackboneUpdate predicts quaternion and translation parameters, which are composed into the running token frames."
            }
          },
          {
            "from": "updated_frames",
            "to": "coordinate_output",
            "label": "keep trans",
            "connection": {
              "title": "Translation-only output",
              "role": "coordinate prediction",
              "inside": "After all structure blocks, Genie3 returns fi.trans. Final rotations are not passed to the sampler."
            }
          },
          {
            "from": "coordinate_output",
            "to": "sampler_state",
            "label": "x_{t-1}",
            "connection": {
              "title": "Sampler state remains Cartesian",
              "role": "diffusion state update",
              "inside": "The next reverse step starts from coordinates and rebuilds frames from scratch."
            }
          }
        ]
      }
    ]
  }
};
